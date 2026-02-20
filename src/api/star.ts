import { createClient } from "@/utils/supabase/client";
import type { MyStars, StarredCrew, StarredGroup, StarredStreamer } from "@/types/star";

const supabase = createClient();

/** 즐겨찾기 대상 타입 */
export type StarTargetType = "streamer" | "group" | "crew";

// ─── 테이블·컬럼 매핑 ──────────────────────────────────────────────
const STAR_TABLE = {
  streamer: "user_star_streamers",
  group: "user_star_groups",
  crew: "user_star_crews",
} as const;

const STAR_FK = {
  streamer: "streamer_id",
  group: "group_id",
  crew: "crew_id",
} as const;

// ─── 즐겨찾기 ID 목록 조회 ──────────────────────────────────────────

/** 유저가 즐겨찾기한 버츄얼 ID 목록을 조회한다 */
export async function fetchStarredStreamerIds(userId: string): Promise<number[]> {
  return fetchStarredIds(userId, "streamer");
}

/** 유저가 즐겨찾기한 그룹 ID 목록을 조회한다 */
export async function fetchStarredGroupIds(userId: string): Promise<number[]> {
  return fetchStarredIds(userId, "group");
}

/** 유저가 즐겨찾기한 크루 ID 목록을 조회한다 */
export async function fetchStarredCrewIds(userId: string): Promise<number[]> {
  return fetchStarredIds(userId, "crew");
}

async function fetchStarredIds(userId: string, type: StarTargetType): Promise<number[]> {
  const table = STAR_TABLE[type];
  const fk = STAR_FK[type];
  const { data, error } = await (supabase as any)
    .from(table)
    .select(fk)
    .eq("user_id", userId);
  if (error) throw error;
  return (data || [])
    .map((row: Record<string, number | null>) => row[fk])
    .filter((id: number | null): id is number => typeof id === "number");
}

// ─── 즐겨찾기 여부 확인 ─────────────────────────────────────────────

/** 특정 대상이 즐겨찾기 되어 있는지 확인한다 */
export async function isStarred(
  userId: string,
  targetId: number,
  type: StarTargetType,
): Promise<boolean> {
  const table = STAR_TABLE[type];
  const fk = STAR_FK[type];
  const { count, error } = await (supabase as any)
    .from(table)
    .select("user_id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq(fk, targetId);
  if (error) throw error;
  return (count || 0) > 0;
}

// ─── 즐겨찾기 토글 (추가/삭제) ──────────────────────────────────────

/** 즐겨찾기를 추가한다 */
export async function addStar(
  userId: string,
  targetId: number,
  type: StarTargetType,
): Promise<void> {
  const table = STAR_TABLE[type];
  const fk = STAR_FK[type];
  const { error } = await (supabase as any).from(table).insert({
    user_id: userId,
    [fk]: targetId,
  });
  if (error) throw error;
}

/** 즐겨찾기를 삭제한다 */
export async function removeStar(
  userId: string,
  targetId: number,
  type: StarTargetType,
): Promise<void> {
  const table = STAR_TABLE[type];
  const fk = STAR_FK[type];
  const { error } = await (supabase as any)
    .from(table)
    .delete()
    .eq("user_id", userId)
    .eq(fk, targetId);
  if (error) throw error;
}

// ─── 즐겨찾기 수 조회 ────────────────────────────────────────────────

const STAR_STATS_TABLE = {
  streamer: "streamer_star_stats",
  group: "group_star_stats",
  crew: "crew_star_stats",
} as const;

/** 대상의 즐겨찾기 수를 조회한다 */
export async function fetchStarCount(
  targetId: number,
  type: StarTargetType,
): Promise<number> {
  const table = STAR_STATS_TABLE[type];
  const fk = STAR_FK[type];
  const { data, error } = await (supabase as any)
    .from(table)
    .select("star_count")
    .eq(fk, targetId)
    .maybeSingle();
  if (error) throw error;
  return data?.star_count ?? 0;
}

// ─── 즐겨찾기 전체 조회 (마이페이지용) ────────────────────────────────

/** 유저의 전체 즐겨찾기(버츄얼·그룹·크루)를 조회한다 */
export async function fetchMyStars(userId: string): Promise<MyStars> {
  const [streamerStarResult, groupStarResult, crewStarResult] = await Promise.all([
    (supabase as any)
      .from("user_star_streamers")
      .select("streamer_id,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    (supabase as any)
      .from("user_star_groups")
      .select("group_id,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
    (supabase as any)
      .from("user_star_crews")
      .select("crew_id,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false }),
  ]);

  if (streamerStarResult.error) throw streamerStarResult.error;
  if (groupStarResult.error) throw groupStarResult.error;
  if (crewStarResult.error) throw crewStarResult.error;

  const streamerIds = (streamerStarResult.data || [])
    .map((row: { streamer_id: number | null }) => row.streamer_id)
    .filter((id: number | null): id is number => typeof id === "number");
  const groupIds = (groupStarResult.data || [])
    .map((row: { group_id: number | null }) => row.group_id)
    .filter((id: number | null): id is number => typeof id === "number");
  const crewIds = (crewStarResult.data || [])
    .map((row: { crew_id: number | null }) => row.crew_id)
    .filter((id: number | null): id is number => typeof id === "number");

  const [streamerResult, groupResult, crewResult] = await Promise.all([
    streamerIds.length > 0
      ? (supabase as any)
        .from("streamers")
        .select("id,public_id,nickname,image_url,platform")
        .in("id", streamerIds)
      : { data: [] as StarredStreamer[], error: null },
    groupIds.length > 0
      ? (supabase as any)
        .from("idol_groups")
        .select("id,group_code,name,image_url")
        .in("id", groupIds)
      : { data: [] as StarredGroup[], error: null },
    crewIds.length > 0
      ? (supabase as any)
        .from("crews")
        .select("id,crew_code,name,image_url")
        .in("id", crewIds)
      : { data: [] as StarredCrew[], error: null },
  ]);

  if (streamerResult.error) throw streamerResult.error;
  if (groupResult.error) throw groupResult.error;
  if (crewResult.error) throw crewResult.error;

  const streamerById = new Map(
    ((streamerResult.data || []) as StarredStreamer[]).map((item) => [item.id, item])
  );
  const groupById = new Map(
    ((groupResult.data || []) as StarredGroup[]).map((item) => [item.id, item])
  );
  const crewById = new Map(
    ((crewResult.data || []) as StarredCrew[]).map((item) => [item.id, item])
  );

  return {
    streamers: streamerIds
      .map((id: number) => streamerById.get(id))
      .filter(Boolean) as StarredStreamer[],
    groups: groupIds.map((id: number) => groupById.get(id)).filter(Boolean) as StarredGroup[],
    crews: crewIds.map((id: number) => crewById.get(id)).filter(Boolean) as StarredCrew[],
  };
}
