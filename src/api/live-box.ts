import { createClient } from "@/utils/supabase/client";
import type { LiveBox, LiveBoxParticipantProfile } from "@/types/live-box";
import { withEffectiveLiveBoxStatus } from "@/utils/live-box-status";

const supabase = createClient();

/** 공개 라이브박스 목록을 최신순으로 조회한다. */
export async function fetchPublicLiveBoxes(): Promise<LiveBox[]> {
  const { data, error } = await supabase
    .from("live_box")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map((liveBox) => withEffectiveLiveBoxStatus(liveBox));
}

/** 공개 라이브박스 단건을 조회한다. */
export async function fetchPublicLiveBoxById(liveBoxId: number): Promise<LiveBox | null> {
  const { data, error } = await supabase
    .from("live_box")
    .select("*")
    .eq("id", liveBoxId)
    .maybeSingle();

  if (error) throw error;
  return data ? withEffectiveLiveBoxStatus(data) : null;
}

/** 라이브박스 참여자 ID 매핑용 스트리머 최소 정보를 조회한다. */
export async function fetchLiveBoxParticipantProfiles(): Promise<LiveBoxParticipantProfile[]> {
  const { data, error } = await supabase
    .from("streamers")
    .select("id,nickname,image_url,chzzk_id,soop_id");

  if (error) throw error;
  return (data || []) as LiveBoxParticipantProfile[];
}
