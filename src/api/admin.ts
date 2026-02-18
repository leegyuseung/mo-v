import { createClient } from "@/utils/supabase/client";
import type { DashboardStats, IdolGroup, IdolGroupUpsertInput, Streamer } from "@/types/admin";
import type { Profile } from "@/types/profile";
import type {
    ChzzkChannelProfile,
    StreamerInfoEditRequest,
    StreamerRegistrationRequest,
    StreamerRequestStatus,
} from "@/types/admin";
import {
    STREAMER_INFO_EDIT_REQUEST_TABLE,
    STREAMER_REQUEST_TABLE,
    STREAMER_TABLE,
} from "@/lib/constant";

export type { DashboardStats, Profile, Streamer };

const supabase = createClient();

export async function fetchDashboardStats(): Promise<DashboardStats> {
    const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

    const { count: totalStreamers } = await supabase
        .from("streamers")
        .select("*", { count: "exact", head: true });

    const { count: totalGroups } = await supabase
        .from("idol_groups")
        .select("*", { count: "exact", head: true });

    let emailUsers = 0;
    let googleUsers = 0;
    let kakaoUsers = 0;

    try {
        const { data: providerCounts } = await supabase.rpc(
            "get_user_count_by_provider"
        );
        if (providerCounts) {
            for (const row of providerCounts) {
                if (row.provider === "email") emailUsers = row.count;
                else if (row.provider === "google") googleUsers = row.count;
                else if (row.provider === "kakao") kakaoUsers = row.count;
            }
        }
    } catch {
        emailUsers = totalUsers || 0;
    }

    return {
        totalUsers: totalUsers || 0,
        emailUsers,
        googleUsers,
        kakaoUsers,
        totalStreamers: totalStreamers || 0,
        totalGroups: totalGroups || 0,
    };
}

// 유저 목록 조회
export async function fetchUsers(): Promise<Profile[]> {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
}

// 유저 정보 수정
export async function updateUser(
    userId: string,
    updates: { nickname?: string; role?: string; bio?: string }
) {
    const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", userId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteUser(userId: string) {
    const { error } = await supabase.from("profiles").delete().eq("id", userId);
    if (error) throw error;
}

// 스트리머 목록 조회
export async function fetchStreamers(): Promise<Streamer[]> {
    const { data, error } = await supabase
        .from("streamers")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
}

// 스트리머 정보 수정
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

    const { error: insertError } = await supabase
        .from(STREAMER_TABLE)
        .insert(insertPayload);

    if (insertError) throw insertError;

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

export async function fetchIdolGroups(): Promise<IdolGroup[]> {
    const { data, error } = await supabase
        .from("idol_groups")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function createIdolGroup(payload: IdolGroupUpsertInput) {
    const { data, error } = await supabase
        .from("idol_groups")
        .insert({
            ...payload,
            members: [],
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function updateIdolGroup(
    groupId: number,
    payload: IdolGroupUpsertInput
) {
    const { data, error } = await supabase
        .from("idol_groups")
        .update({
            ...payload,
        })
        .eq("id", groupId)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteIdolGroup(groupId: number) {
    const { error } = await supabase
        .from("idol_groups")
        .delete()
        .eq("id", groupId);

    if (error) throw error;
}

export async function uploadIdolGroupImage(file: File) {
    const fileExt = (file.name.split(".").pop() || "png").toLowerCase();
    const randomKey =
        typeof crypto !== "undefined" && "randomUUID" in crypto
            ? crypto.randomUUID().replace(/-/g, "")
            : Math.random().toString(36).slice(2, 14);
    // 긴 원본 파일명으로 인한 URL/오브젝트 키 이슈를 피하기 위해
    // 원본 이름 대신 짧은 랜덤 키 기반으로 저장한다.
    const filePath = `idol-groups/${Date.now()}_${randomKey}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
        .from("group-images")
        .upload(filePath, file, { upsert: false });

    if (uploadError) throw uploadError;

    const {
        data: { publicUrl },
    } = supabase.storage.from("group-images").getPublicUrl(filePath);

    return publicUrl;
}
