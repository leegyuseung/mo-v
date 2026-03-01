import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { ADMIN_ERROR_REPORT_REWARD_POINT } from "@/lib/constant";
import { creditAdminRewardPoint } from "@/utils/admin-reward";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type ResolveAction = "approve" | "reject";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return NextResponse.json({ message: "서버 설정이 올바르지 않습니다." }, { status: 500 });
  }

  const { id } = await context.params;
  const requestId = Number(id);
  if (!Number.isInteger(requestId) || requestId <= 0) {
    return NextResponse.json({ message: "잘못된 요청 ID입니다." }, { status: 400 });
  }

  let action: ResolveAction;
  try {
    const body = (await request.json()) as { action?: ResolveAction };
    action =
      body.action === "approve"
        ? "approve"
        : body.action === "reject"
          ? "reject"
          : ("" as ResolveAction);
  } catch {
    return NextResponse.json({ message: "잘못된 요청 본문입니다." }, { status: 400 });
  }

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ message: "잘못된 처리 방식입니다." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const { data: me, error: meError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (meError) {
    return NextResponse.json({ message: "권한 확인에 실패했습니다." }, { status: 500 });
  }

  if ((me?.role || "").trim().toLowerCase() !== "admin") {
    return NextResponse.json({ message: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const admin = createAdminClient(supabaseUrl, serviceRoleKey);

  try {
    const nextStatus = action === "approve" ? "resolved" : "rejected";
    const reviewedAt = new Date().toISOString();
    const { data: resolvedRow, error: updateError } = await admin
      .from("error_reports")
      .update({
        status: nextStatus,
        reviewed_by: user.id,
        reviewed_at: reviewedAt,
      })
      .eq("id", requestId)
      .eq("status", "pending")
      .select("id,reporter_id")
      .maybeSingle();

    if (updateError) {
      if (updateError.code === "23514") {
        return NextResponse.json(
          {
            message:
              "error_reports.status 제약에 resolved 상태가 없습니다.",
          },
          { status: 400 }
        );
      }
      throw updateError;
    }

    if (!resolvedRow) {
      const { data: existingRow, error: existingError } = await admin
        .from("error_reports")
        .select("id")
        .eq("id", requestId)
        .maybeSingle();
      if (existingError) throw existingError;
      if (!existingRow) {
        return NextResponse.json(
          { message: "이미 처리되었거나 존재하지 않는 요청입니다." },
          { status: 404 }
        );
      }
      return NextResponse.json({ message: "이미 처리된 요청입니다." }, { status: 409 });
    }

    if (action === "approve" && resolvedRow.reporter_id) {
      await creditAdminRewardPoint(
        admin,
        resolvedRow.reporter_id,
        ADMIN_ERROR_REPORT_REWARD_POINT,
        "홈페이지 오류 신고 확인"
      );
    }

    return NextResponse.json({
      success: true,
      action,
      status: nextStatus,
      rewarded: action === "approve" && Boolean(resolvedRow.reporter_id),
      rewardPoint:
        action === "approve" && resolvedRow.reporter_id
          ? ADMIN_ERROR_REPORT_REWARD_POINT
          : 0,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "오류 신고 처리에 실패했습니다.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
