import { createClient } from "@/utils/supabase/client";
import type {
  LiveBox,
  LiveBoxCreateInput,
  LiveBoxUpdateInput,
  LiveBoxWithCreatorProfile,
} from "@/types/live-box";
import {
  assertValidLiveBoxPayload,
  toLiveBoxPersistPayload,
} from "@/utils/admin-live-box";
import { withEffectiveLiveBoxStatus } from "@/utils/live-box-status";

const supabase = createClient();

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
    .insert(toLiveBoxPersistPayload(payload))
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
    .update(toLiveBoxPersistPayload(payload))
    .eq("id", liveBoxId)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

/** 라이브 박스를 삭제한다. */
export async function deleteLiveBox(liveBoxId: number): Promise<void> {
  const { error } = await supabase.from("live_box").delete().eq("id", liveBoxId);
  if (error) throw error;
}
