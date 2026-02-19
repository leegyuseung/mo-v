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

export async function deleteStreamer(streamerId: number) {
    const { error } = await supabase.from("streamers").delete().eq("id", streamerId);
    if (error) throw error;
}

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

export async function deleteStreamerRequest(requestId: number) {
    const { error } = await supabase
        .from(STREAMER_REQUEST_TABLE)
        .delete()
        .eq("id", requestId);

    if (error) throw error;
}

export async function registerStreamerFromRequest(
    requestId: number,
    payload: { nickname: string; imageUrl: string; groupName: string[] | null }
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
        chzzk_id: request.platform === "chzzk" ? request.platform_streamer_id : null,
        soop_id: request.platform === "soop" ? request.platform_streamer_id : null,
        image_url: payload.imageUrl,
        group_name: payload.groupName,
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

export async function deleteStreamerInfoEditRequest(requestId: number) {
    const { error } = await supabase
        .from(STREAMER_INFO_EDIT_REQUEST_TABLE)
        .delete()
        .eq("id", requestId);

    if (error) throw error;
}

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
