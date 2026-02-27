import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return NextResponse.json({ message: "서버 설정이 올바르지 않습니다." }, { status: 500 });
  }

  const { id } = await context.params;
  const contentId = Number(id);
  if (!Number.isInteger(contentId) || contentId <= 0) {
    return NextResponse.json({ message: "잘못된 콘텐츠 ID입니다." }, { status: 400 });
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

  const admin = createAdminClient(supabaseUrl, serviceRoleKey);

  const [{ data: content, error: contentError }, { data: me, error: meError }] =
    await Promise.all([
      admin
        .from("contents")
        .select("id,created_by,status")
        .eq("id", contentId)
        .maybeSingle(),
      admin.from("profiles").select("role").eq("id", user.id).maybeSingle(),
    ]);

  if (contentError || meError) {
    return NextResponse.json({ message: "권한 확인에 실패했습니다." }, { status: 500 });
  }

  if (!content) {
    return NextResponse.json({ message: "콘텐츠를 찾을 수 없습니다." }, { status: 404 });
  }

  const isAdmin = (me?.role || "").trim().toLowerCase() === "admin";
  const isAuthor = Boolean(content.created_by && content.created_by === user.id);
  if (!isAuthor && !isAdmin) {
    return NextResponse.json(
      { message: "작성자 또는 관리자만 조기마감할 수 있습니다." },
      { status: 403 }
    );
  }

  if (content.status === "ended") {
    return NextResponse.json({
      status: "ended",
      message: "이미 종료된 콘텐츠입니다.",
    });
  }

  if (content.status !== "approved") {
    return NextResponse.json(
      { message: "모집중 상태의 콘텐츠만 조기마감할 수 있습니다." },
      { status: 400 }
    );
  }

  const nowIso = new Date().toISOString();
  const { data: updatedRow, error: updateError } = await admin
    .from("contents")
    .update({
      status: "ended",
      updated_at: nowIso,
      updated_by: user.id,
    })
    .eq("id", contentId)
    .eq("status", "approved")
    .select("id,status")
    .maybeSingle();

  if (updateError) {
    return NextResponse.json({ message: "조기마감 처리에 실패했습니다." }, { status: 500 });
  }

  if (!updatedRow) {
    return NextResponse.json(
      { message: "이미 처리되었거나 조기마감할 수 없는 상태입니다." },
      { status: 409 }
    );
  }

  return NextResponse.json({
    id: updatedRow.id,
    status: updatedRow.status,
  });
}
