import { createClient } from "@/utils/supabase/client";
import type {
  LiveBox,
  LiveBoxCreateInput,
  LiveBoxUpdateInput,
  LiveBoxWithCreatorProfile,
} from "@/types/live-box";
import { withEffectiveLiveBoxStatus } from "@/utils/live-box-status";

const supabase = createClient();

function toTimestampOrNull(value: string | null) {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

/**
 * 클라이언트 조작으로 잘못된 payload가 전달돼도 DB 쓰기 전에 1차 검증한다.
 * 왜: UI validation 우회 시 서버 오류를 줄이고 요청 의도를 명확히 보장하기 위함.
 */
function assertValidLiveBoxPayload(payload: LiveBoxCreateInput | LiveBoxUpdateInput) {
  if (!payload.title.trim()) {
    throw new Error("제목은 필수입니다.");
  }

  if (!Array.isArray(payload.category) || payload.category.length === 0) {
    throw new Error("카테고리를 1개 이상 입력해 주세요.");
  }

  const startsAtTimestamp = toTimestampOrNull(payload.starts_at);
  const endsAtTimestamp = toTimestampOrNull(payload.ends_at);

  if (payload.starts_at && startsAtTimestamp === null) {
    throw new Error("시작일시 형식이 올바르지 않습니다.");
  }

  if (payload.ends_at && endsAtTimestamp === null) {
    throw new Error("종료일시 형식이 올바르지 않습니다.");
  }

  if (
    startsAtTimestamp !== null &&
    endsAtTimestamp !== null &&
    startsAtTimestamp > endsAtTimestamp
  ) {
    throw new Error("시작일시는 종료일시보다 늦을 수 없습니다.");
  }
}

/** 관리자 박스 목록을 최신순으로 조회한다. */
export async function fetchLiveBoxes(): Promise<LiveBoxWithCreatorProfile[]> {
  const { data, error } = await supabase
    .from("live_box")
    .select("*, creator_profile:profiles!live_box_created_by_fkey(nickname)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data || []) as LiveBoxWithCreatorProfile[]).map((liveBox) =>
    withEffectiveLiveBoxStatus(liveBox)
  );
}

/** 라이브 박스를 생성한다. created_by는 DB 기본값(auth.uid())을 사용한다. */
export async function createLiveBox(payload: LiveBoxCreateInput): Promise<LiveBox> {
  assertValidLiveBoxPayload(payload);

  const { data, error } = await supabase
    .from("live_box")
    .insert({
      title: payload.title,
      category: payload.category,
      participant_streamer_ids: payload.participant_streamer_ids,
      starts_at: payload.starts_at,
      ends_at: payload.ends_at,
      description: payload.description,
      status: payload.status,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

/** 라이브 박스를 수정한다. */
export async function updateLiveBox(
  liveBoxId: number,
  payload: LiveBoxUpdateInput
): Promise<LiveBox> {
  assertValidLiveBoxPayload(payload);

  const { data, error } = await supabase
    .from("live_box")
    .update({
      title: payload.title,
      category: payload.category,
      participant_streamer_ids: payload.participant_streamer_ids,
      starts_at: payload.starts_at,
      ends_at: payload.ends_at,
      description: payload.description,
      status: payload.status,
    })
    .eq("id", liveBoxId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
