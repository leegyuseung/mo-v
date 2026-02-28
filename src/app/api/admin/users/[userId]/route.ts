import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { deleteUserCompletely } from "@/utils/user-cleanup";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Admin 전용 회원 삭제 API — 참조 데이터 정리 후 Auth 계정까지 삭제한다. */
export async function DELETE(
  _request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return NextResponse.json(
      { message: "서버 설정이 올바르지 않습니다." },
      { status: 500 }
    );
  }

  const { userId } = await context.params;
  if (!userId) {
    return NextResponse.json(
      { message: "유저 ID가 필요합니다." },
      { status: 400 }
    );
  }

  // 요청자가 admin인지 확인
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
    data: { user: caller },
    error: callerError,
  } = await supabase.auth.getUser();

  if (callerError || !caller) {
    return NextResponse.json(
      { message: "인증된 사용자 정보를 확인할 수 없습니다." },
      { status: 401 }
    );
  }

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", caller.id)
    .single();

  if (callerProfile?.role !== "admin") {
    return NextResponse.json(
      { message: "관리자 권한이 필요합니다." },
      { status: 403 }
    );
  }

  const admin = createAdminClient(supabaseUrl, serviceRoleKey);

  try {
    await deleteUserCompletely(admin, userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "회원 삭제 처리 중 오류가 발생했습니다.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
