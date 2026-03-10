import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import { ENTITY_INFO_EDIT_REQUEST_TABLE } from "@/lib/constant";
import { getAccountRestrictionMessage } from "@/utils/account-status";
import type {
  CreateLiveBoxInfoEditRequestInput,
  LiveBox,
  LiveBoxParticipantProfile,
} from "@/types/live-box";
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

/** 특정 스트리머 플랫폼 ID(chzzk/soop) 배열과 겹치는 공개 라이브박스만 조회한다. */
export async function fetchParticipatingPublicLiveBoxes(
  platformIds: string[],
  client?: SupabaseClient
): Promise<LiveBox[]> {
  const normalizedPlatformIds = Array.from(
    new Set(
      platformIds
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean)
    )
  );

  if (normalizedPlatformIds.length === 0) {
    return [];
  }

  const sb = client || getDefaultClient();
  const { data, error } = await sb
    .from("live_box")
    .select("*")
    .overlaps("participant_streamer_ids", normalizedPlatformIds)
    .order("starts_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data || [])
    .map((liveBox) => withEffectiveLiveBoxStatus(liveBox))
    .filter((liveBox) => liveBox.status === "대기" || liveBox.status === "진행중");
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
    .select("id,public_id,nickname,image_url,chzzk_id,soop_id");

  if (error) throw error;
  return (data || []) as LiveBoxParticipantProfile[];
}

/** 라이브박스 정보수정요청을 생성한다. */
export async function createLiveBoxInfoEditRequest({
  content,
  liveBoxId,
  liveBoxTitle,
  requesterNickname,
}: CreateLiveBoxInfoEditRequestInput) {
  const supabase = getDefaultClient();
  const trimmedContent = content.trim();
  if (!trimmedContent) {
    throw new Error("수정 요청 내용을 입력해 주세요.");
  }
  if (!Number.isInteger(liveBoxId) || liveBoxId <= 0) {
    throw new Error("유효하지 않은 라이브박스 요청입니다.");
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("로그인 후 정보 수정 요청이 가능합니다.");
  }

  const { data: profileStatus, error: profileStatusError } = await supabase
    .from("profiles")
    .select("account_status,suspended_until")
    .eq("id", user.id)
    .single();

  if (profileStatusError) throw profileStatusError;

  const restrictionMessage = getAccountRestrictionMessage(profileStatus);
  if (restrictionMessage) {
    throw new Error(restrictionMessage);
  }

  const { error } = await supabase.from(ENTITY_INFO_EDIT_REQUEST_TABLE).insert({
    target_type: "live_box",
    target_id: liveBoxId,
    target_code: String(liveBoxId),
    target_name: liveBoxTitle,
    content: trimmedContent,
    requester_id: user.id,
    requester_nickname: requesterNickname,
    status: "pending",
  });

  if (error) throw error;
}
