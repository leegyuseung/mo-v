import { createClient } from "@/utils/supabase/client";
import type { DashboardStats, Streamer } from "@/types/admin";
import type { Profile } from "@/types/profile";

export type { DashboardStats, Profile, Streamer };

const supabase = createClient();

export async function fetchDashboardStats(): Promise<DashboardStats> {
    const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

    const { count: totalStreamers } = await supabase
        .from("streamers")
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
