import { createClient } from "@/utils/supabase/client";
import type {
  CreateStreamerInfoEditRequestInput,
  CreateStreamerRequestInput,
  StreamerListParams,
  StreamerListResponse,
} from "@/types/streamer";
import {
  STREAMER_INFO_EDIT_REQUEST_TABLE,
  STREAMER_REQUEST_TABLE,
  STREAMER_TABLE,
} from "@/lib/constant";

const supabase = createClient();

export async function fetchStreamers({
  page,
  pageSize,
  platform,
  sortOrder,
  keyword,
}: StreamerListParams): Promise<StreamerListResponse> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from(STREAMER_TABLE)
    .select("*", { count: "exact" })
    .order("nickname", { ascending: sortOrder === "asc" })
    .order("created_at", { ascending: false });

  if (platform !== "all") {
    query = query.eq("platform", platform);
  }
  if (keyword.trim()) {
    query = query.ilike("nickname", `%${keyword.trim()}%`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw error;
  }

  return {
    data: data || [],
    count: count || 0,
  };
}

export async function fetchStreamerByPublicId(streamerPublicId: string) {
  const query = supabase.from(STREAMER_TABLE).select("*");
  const isLegacyNumericId = /^[0-9]+$/.test(streamerPublicId);
  const { data, error } = await (isLegacyNumericId
    ? query.eq("id", Number(streamerPublicId)).single()
    : query.eq("public_id", streamerPublicId).single());

  if (error) {
    throw error;
  }

  return data;
}

export async function createStreamerRegistrationRequest({
  requesterId,
  platform,
  platformStreamerId,
  platformStreamerUrl,
}: CreateStreamerRequestInput) {
  const { data: existingPending, error: existsError } = await supabase
    .from(STREAMER_REQUEST_TABLE)
    .select("id")
    .eq("platform_streamer_url", platformStreamerUrl)
    .eq("status", "pending")
    .limit(1);

  if (existsError) {
    throw existsError;
  }

  if (existingPending && existingPending.length > 0) {
    throw new Error("이미 처리대기중입니다.");
  }

  const { error } = await supabase.from(STREAMER_REQUEST_TABLE).insert({
    requester_id: requesterId,
    platform,
    platform_streamer_id: platformStreamerId,
    platform_streamer_url: platformStreamerUrl,
    status: "pending",
  });

  if (error) {
    throw error;
  }
}

export async function createStreamerInfoEditRequest({
  content,
  streamerId,
  streamerNickname,
  requesterId,
  requesterNickname,
}: CreateStreamerInfoEditRequestInput) {
  const trimmedContent = content.trim();
  if (!trimmedContent) {
    throw new Error("수정 요청 내용을 입력해 주세요.");
  }

  const { error } = await supabase.from(STREAMER_INFO_EDIT_REQUEST_TABLE).insert({
    content: trimmedContent,
    streamer_id: streamerId,
    streamer_nickname: streamerNickname,
    requester_id: requesterId,
    requester_nickname: requesterNickname,
  });

  if (error) {
    throw error;
  }
}
