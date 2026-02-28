import type { SupabaseClient } from "@supabase/supabase-js";

/** 테이블에서 특정 컬럼 값에 해당하는 레코드를 삭제한다. 테이블 미존재 시 무시. */
async function deleteIfExists(
  admin: SupabaseClient,
  table: string,
  column: string,
  value: string
) {
  const { error } = await admin.from(table).delete().eq(column, value);
  if (error && error.code !== "42P01") {
    throw error;
  }
}

/**
 * 사용자의 모든 참조 데이터를 정리하고 프로필·Auth 계정을 삭제한다.
 * Service Role Key로 생성된 admin 클라이언트가 필요하다.
 */
export async function deleteUserCompletely(
  admin: SupabaseClient,
  userId: string
) {
  // 참조 데이터 정리 (FK 제약 조건 순서 고려)
  await deleteIfExists(admin, "streamer_heart_history", "from_user_id", userId);
  await deleteIfExists(admin, "streamer_info_edit_requests", "requester_id", userId);
  await deleteIfExists(admin, "heart_point_history", "user_id", userId);
  await deleteIfExists(admin, "heart_points", "id", userId);
  await deleteIfExists(admin, "user_star_streamers", "user_id", userId);
  await deleteIfExists(admin, "user_star_groups", "user_id", userId);
  await deleteIfExists(admin, "user_star_crews", "user_id", userId);
  await deleteIfExists(admin, "content_favorites", "user_id", userId);
  await deleteIfExists(admin, "profiles", "id", userId);

  // Supabase Auth 사용자 삭제
  const { error: deleteAuthError } = await admin.auth.admin.deleteUser(userId);
  if (deleteAuthError) throw deleteAuthError;
}
