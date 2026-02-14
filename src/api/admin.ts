import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export type DashboardStats = {
    totalUsers: number;
    emailUsers: number;
    googleUsers: number;
    kakaoUsers: number;
    totalStreamers: number;
};

export async function fetchDashboardStats(): Promise<DashboardStats> {
    // 전체 유저 수
    const { count: totalUsers } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

    // 스트리머 수
    const { count: totalStreamers } = await supabase
        .from("streamers")
        .select("*", { count: "exact", head: true });

    // Provider별 유저 수 (RPC)
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
