import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import type { LiveBox, LiveBoxParticipantProfile } from "@/types/live-box";
import { withEffectiveLiveBoxStatus } from "@/utils/live-box-status";

/** 클라이언트 환경에서만 초기화되는 Supabase 인스턴스. 서버에서 모듈이 import되어도 즉시 초기화되지 않는다 */
let _defaultClient: ReturnType<typeof createClient> | null = null;
function getDefaultClient() {
  if (!_defaultClient) _defaultClient = createClient();
  return _defaultClient;
}

/** 공개 라이브박스 목록을 최신순으로 조회한다. 서버에서 호출 시 Supabase 클라이언트를 주입할 수 있다 */
export async function fetchPublicLiveBoxes(client?: SupabaseClient): Promise<LiveBox[]> {
  const sb = client || getDefaultClient();
  const { data, error } = await sb
    .from("live_box")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []).map((liveBox) => withEffectiveLiveBoxStatus(liveBox));
}

/** 공개 라이브박스 단건을 조회한다. */
export async function fetchPublicLiveBoxById(liveBoxId: number): Promise<LiveBox | null> {
  const { data, error } = await getDefaultClient()
    .from("live_box")
    .select("*")
    .eq("id", liveBoxId)
    .maybeSingle();

  if (error) throw error;
  return data ? withEffectiveLiveBoxStatus(data) : null;
}

/** 라이브박스 참여자 ID 매핑용 스트리머 최소 정보를 조회한다. */
export async function fetchLiveBoxParticipantProfiles(): Promise<LiveBoxParticipantProfile[]> {
  const { data, error } = await getDefaultClient()
    .from("streamers")
    .select("id,nickname,image_url,chzzk_id,soop_id");

  if (error) throw error;
  return (data || []) as LiveBoxParticipantProfile[];
}
