import { createClient } from "@/utils/supabase/client";
import type {
    ChzzkChannelProfile,
    StreamerInfoEditRequest,
    StreamerRegistrationRequest,
    StreamerRequestStatus,
} from "@/types/admin";
import type { Streamer } from "@/types/streamer";
import {
    STREAMER_INFO_EDIT_REQUEST_TABLE,
    STREAMER_REQUEST_TABLE,
    STREAMER_TABLE,
} from "@/lib/constant";

const supabase = createClient();

// 버츄얼 목록 조회
export async function fetchStreamers(): Promise<Streamer[]> {
    const { data, error } = await supabase
        .from("streamers")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
}

// 버츄얼 정보 수정
export async function updateStreamer(
    streamerId: number,
    updates: {
        nickname?: string;
        platform?: string;
        chzzk_id?: string | null;
        soop_id?: string | null;
        image_url?: string | null;
        group_name?: string[] | null;
        crew_name?: string[] | null;
        birthday?: string | null;
        nationality?: string | null;
        gender?: string | null;
        genre?: string[] | null;
        first_stream_date?: string | null;
        fandom_name?: string | null;
        mbti?: string | null;
        alias?: string[] | null;
        platform_url?: string | null;
        fancafe_url?: string | null;
        youtube_url?: string | null;
    }
) {
    const { data, error } = await supabase
        .from("streamers")
        .update(updates)
        .eq("id", streamerId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/** 버켄얼을 삭제한다 */
export async function deleteStreamer(streamerId: number) {
    const { error } = await supabase.from("streamers").delete().eq("id", streamerId);
    if (error) throw error;
}

/** 대기 중인 스트리머 등록 요청 목록을 조회한다 */
export async function fetchPendingStreamerRequests(): Promise<
    StreamerRegistrationRequest[]
> {
    const { data, error } = await supabase
        .from(STREAMER_REQUEST_TABLE)
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as StreamerRegistrationRequest[];
}

/** 등록 요청의 상태를 변경한다 (approved/rejected 등) */
export async function updateStreamerRequestStatus(
    requestId: number,
    status: StreamerRequestStatus
) {
    const { data, error } = await supabase
        .from(STREAMER_REQUEST_TABLE)
        .update({
            status,
            reviewed_at: new Date().toISOString(),
        })
        .eq("id", requestId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

/** 등록 요청을 삭제한다 */
export async function deleteStreamerRequest(requestId: number) {
    const { error } = await supabase
        .from(STREAMER_REQUEST_TABLE)
        .delete()
        .eq("id", requestId);

    if (error) throw error;
}

/**
 * 등록 요청을 승인하여 버켄얼을 생성한다.
 * streamers 테이블에 삽입 후 streamer_hearts 초기 행도 함께 생성한다.
 * 하트 초기화 실패 시 생성된 버켄얼도 롤백한다.
 */
export async function registerStreamerFromRequest(
    requestId: number,
    payload: {
        nickname: string;
        imageUrl: string;
        chzzkId: string | null;
        soopId: string | null;
        groupName: string[] | null;
        crewName: string[] | null;
        birthday: string | null;
        nationality: string | null;
        gender: string | null;
        genre: string[] | null;
        firstStreamDate: string | null;
        fandomName: string | null;
        mbti: string | null;
        alias: string[] | null;
        platformUrl: string | null;
        fancafeUrl: string | null;
        youtubeUrl: string | null;
    }
) {
    const { data: request, error: requestError } = await supabase
        .from(STREAMER_REQUEST_TABLE)
        .select("*")
        .eq("id", requestId)
        .single();

    if (requestError) throw requestError;
    if (!request || request.status !== "pending") {
        throw new Error("이미 처리된 요청입니다.");
    }

    const insertPayload = {
        nickname: payload.nickname,
        platform: request.platform,
        chzzk_id:
            payload.chzzkId ??
            (request.platform === "chzzk" ? request.platform_streamer_id : null),
        soop_id:
            payload.soopId ??
            (request.platform === "soop" ? request.platform_streamer_id : null),
        image_url: payload.imageUrl,
        group_name: payload.groupName,
        crew_name: payload.crewName,
        birthday: payload.birthday,
        nationality: payload.nationality,
        gender: payload.gender,
        genre: payload.genre,
        first_stream_date: payload.firstStreamDate,
        fandom_name: payload.fandomName,
        mbti: payload.mbti,
        alias: payload.alias,
        platform_url: payload.platformUrl,
        fancafe_url: payload.fancafeUrl,
        youtube_url: payload.youtubeUrl,
    };

    const { data: insertedStreamer, error: insertError } = await supabase
        .from(STREAMER_TABLE)
        .insert(insertPayload)
        .select("id")
        .single();

    if (insertError) throw insertError;
    if (!insertedStreamer) throw new Error("버츄얼 생성 결과를 확인하지 못했습니다.");

    // 버츄얼 하트 누적 테이블의 초기 행을 함께 생성한다.
    const { error: heartsError } = await supabase.from("streamer_hearts").upsert({
        streamer_id: insertedStreamer.id,
        total_received: 0,
    });

    if (heartsError) {
        // 하트 초기화가 실패하면 생성된 버츄얼도 롤백해 불일치 상태를 방지한다.
        await supabase.from(STREAMER_TABLE).delete().eq("id", insertedStreamer.id);
        throw heartsError;
    }

    const { error: deleteError } = await supabase
        .from(STREAMER_REQUEST_TABLE)
        .delete()
        .eq("id", requestId);

    if (deleteError) throw deleteError;
}

/** 정보 수정 요청 목록을 최신순으로 조회한다 */
export async function fetchStreamerInfoEditRequests(): Promise<
    StreamerInfoEditRequest[]
> {
    const { data, error } = await supabase
        .from(STREAMER_INFO_EDIT_REQUEST_TABLE)
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as StreamerInfoEditRequest[];
}

/** 정보 수정 요청을 삭제한다 */
export async function deleteStreamerInfoEditRequest(requestId: number) {
  const { error } = await supabase
    .from(STREAMER_INFO_EDIT_REQUEST_TABLE)
    .delete()
    .eq("id", requestId);

  if (error) throw error;
}

/** 정보 수정 요청을 확인/거절 처리한다. 확인 시 요청자에게 50 하트가 지급된다. */
export async function resolveStreamerInfoEditRequest(
  requestId: number,
  action: "approve" | "reject"
) {
  const response = await fetch(
    `/api/admin/info-edit-requests/${requestId}/resolve`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    }
  );

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message || "요청 처리에 실패했습니다.");
  }

  return response.json();
}

/** 치지직 채널 프로필 정보를 조회한다 (Next.js API 라우트 경유) */
export async function fetchChzzkChannelProfile(
    channelId: string
): Promise<ChzzkChannelProfile> {
    const response = await fetch(
        `/api/chzzk/channels?channelIds=${encodeURIComponent(channelId)}`
    );

    if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.message || "치지직 채널 정보를 불러오지 못했습니다.");
    }

    return response.json();
}
