import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function deleteIfExists(
  admin: any,
  table: string,
  column: string,
  value: string
) {
  const { error } = await (admin as any).from(table).delete().eq(column, value);

  // 테이블이 아직 없는 환경(마이그레이션 미적용)은 무시한다.
  if (error && error.code !== "42P01") {
    throw error;
  }
}

export async function DELETE() {
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return NextResponse.json(
      { message: "서버 설정이 올바르지 않습니다." },
      { status: 500 }
    );
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
    return NextResponse.json(
      { message: "인증된 사용자 정보를 확인할 수 없습니다." },
      { status: 401 }
    );
  }

  const admin = createAdminClient(supabaseUrl, serviceRoleKey);

  try {
    // 프로필 삭제 전, 참조되는 기록을 먼저 정리한다.
    await deleteIfExists(admin, "streamer_heart_history", "from_user_id", user.id);
    await deleteIfExists(admin, "streamer_info_edit_requests", "requester_id", user.id);

    // 하트/즐겨찾기/프로필 데이터 정리
    await deleteIfExists(admin, "heart_point_history", "user_id", user.id);
    await deleteIfExists(admin, "heart_points", "id", user.id);
    await deleteIfExists(admin, "user_star_streamers", "user_id", user.id);
    await deleteIfExists(admin, "user_star_groups", "user_id", user.id);
    await deleteIfExists(admin, "user_star_crews", "user_id", user.id);
    await deleteIfExists(admin, "profiles", "id", user.id);

    const { error: deleteAuthError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteAuthError) throw deleteAuthError;

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "회원탈퇴 처리 중 오류가 발생했습니다.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
