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
  sortBy,
  sortOrder,
  keyword,
}: StreamerListParams): Promise<StreamerListResponse> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const trimmedKeyword = keyword.trim();

  if (sortBy === "heart") {
    let rankQuery = supabase
      .from("streamer_heart_rank")
      .select("streamer_id, total_received, nickname, platform", { count: "exact" })
      .order("total_received", { ascending: sortOrder === "asc", nullsFirst: false })
      .order("nickname", { ascending: true });

    if (platform !== "all") {
      rankQuery = rankQuery.eq("platform", platform);
    }
    if (trimmedKeyword) {
      rankQuery = rankQuery.ilike("nickname", `%${trimmedKeyword}%`);
    }

    const { data: rankRows, error: rankError, count } = await rankQuery.range(from, to);
    if (rankError) throw rankError;

    const orderedIds =
      rankRows
        ?.map((row) => row.streamer_id)
        .filter((id): id is number => typeof id === "number") || [];

    if (orderedIds.length === 0) {
      return { data: [], count: count || 0 };
    }

    const { data: streamerRows, error: streamerError } = await supabase
      .from(STREAMER_TABLE)
      .select("*")
      .in("id", orderedIds);

    if (streamerError) throw streamerError;

    const streamerById = new Map((streamerRows || []).map((row) => [row.id, row]));
    const orderedStreamers = orderedIds
      .map((id) => streamerById.get(id))
      .filter(Boolean);

    return {
      data: orderedStreamers,
      count: count || 0,
    };
  }

  let query = supabase
    .from(STREAMER_TABLE)
    .select("*", { count: "exact" })
    .order("nickname", { ascending: sortOrder === "asc" })
    .order("created_at", { ascending: false });

  if (platform !== "all") {
    query = query.eq("platform", platform);
  }
  if (trimmedKeyword) {
    query = query.ilike("nickname", `%${trimmedKeyword}%`);
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
