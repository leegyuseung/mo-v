import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { ADMIN_REVIEW_REWARD_POINT } from "@/lib/constant";
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
  let reviewNote = "";
  try {
    const body = (await request.json()) as {
      action?: ResolveAction;
      reviewNote?: string;
    };
    action =
      body.action === "approve"
        ? "approve"
        : body.action === "reject"
          ? "reject"
          : ("" as ResolveAction);
    reviewNote = typeof body.reviewNote === "string" ? body.reviewNote.trim() : "";
  } catch {
    return NextResponse.json({ message: "잘못된 요청 본문입니다." }, { status: 400 });
  }

  if (action !== "approve" && action !== "reject") {
    return NextResponse.json({ message: "잘못된 처리 방식입니다." }, { status: 400 });
  }
  if (action === "reject" && !reviewNote) {
    return NextResponse.json({ message: "거절 사유를 입력해 주세요." }, { status: 400 });
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
    const nextStatus = action === "approve" ? "approved" : "rejected";

    const { data: resolvedRow, error: updateError } = await admin
      .from("entity_report_requests")
      .update({
        status: nextStatus,
        review_note: action === "reject" ? reviewNote : null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
      })
      .eq("id", requestId)
      .eq("status", "pending")
      .select("id,reporter_id")
      .maybeSingle();
    if (updateError) throw updateError;
    if (!resolvedRow) {
      const { data: existingRow, error: existingError } = await admin
        .from("entity_report_requests")
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

    if (action === "approve") {
      await creditAdminRewardPoint(
        admin,
        resolvedRow.reporter_id,
        ADMIN_REVIEW_REWARD_POINT,
        "신고 확인"
      );
    }

    return NextResponse.json({
      success: true,
      action,
      status: nextStatus,
      rewarded: action === "approve",
      rewardPoint: action === "approve" ? ADMIN_REVIEW_REWARD_POINT : 0,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "신고 처리에 실패했습니다.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
