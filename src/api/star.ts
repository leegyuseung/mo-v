import { createClient } from "@/utils/supabase/client";
import type { MyStars, StarredCrew, StarredGroup, StarredStreamer } from "@/types/star";

const supabase = createClient();

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
