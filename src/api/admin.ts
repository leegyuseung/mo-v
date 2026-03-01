import { createClient } from "@/utils/supabase/client";
import type { DashboardSignupTrendPoint, DashboardStats } from "@/types/admin-dashboard";
import type { Profile } from "@/types/profile";
import { validateNicknameInput } from "@/utils/validate";

export type { DashboardStats, Profile };

const supabase = createClient();

function buildSignupTrend(
    rows: Array<{ created_at: string; provider: string | null }> | null,
    days: number
): DashboardSignupTrendPoint[] {
    const todayUtc = new Date();
    const startDate = new Date(
        Date.UTC(
            todayUtc.getUTCFullYear(),
            todayUtc.getUTCMonth(),
            todayUtc.getUTCDate()
        )
    );
    startDate.setUTCDate(startDate.getUTCDate() - (days - 1));

    const trendMap = new Map<string, DashboardSignupTrendPoint>();

    for (let i = 0; i < days; i += 1) {
        const date = new Date(startDate);
        date.setUTCDate(startDate.getUTCDate() + i);
        const key = date.toISOString().slice(0, 10);

        trendMap.set(key, {
            date: key,
            total: 0,
            email: 0,
            google: 0,
            kakao: 0,
        });
    }

    (rows || []).forEach((row) => {
        const dayKey = row.created_at.slice(0, 10);
        const point = trendMap.get(dayKey);
        if (!point) return;

        point.total += 1;
        if (row.provider === "google") {
            point.google += 1;
            return;
        }
        if (row.provider === "kakao") {
            point.kakao += 1;
            return;
        }
        point.email += 1;
    });

    return Array.from(trendMap.values());
}

/** 관리자 대시보드 통계를 집계하여 반환한다 */
export async function fetchDashboardStats(): Promise<DashboardStats> {
    const trendDays = 14;
    const todayUtc = new Date();
    const trendStart = new Date(
        Date.UTC(
            todayUtc.getUTCFullYear(),
            todayUtc.getUTCMonth(),
            todayUtc.getUTCDate()
        )
    );
    trendStart.setUTCDate(trendStart.getUTCDate() - (trendDays - 1));

    const [
        { count: totalUsers },
        { count: totalStreamers },
        { count: totalGroups },
        { count: totalCrews },
        { count: totalLiveBoxes },
        { count: totalContents },
        { count: pendingStreamerRequests },
        { count: pendingStreamerInfoEditRequests },
        { count: pendingEntityInfoEditRequests },
        { count: pendingReportRequests },
        { count: pendingHomepageErrorReports },
        { count: pendingLiveBoxRequests },
        { count: pendingContentRequests },
        { data: signupRows, error: signupRowsError },
    ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("streamers").select("*", { count: "exact", head: true }),
        supabase.from("idol_groups").select("*", { count: "exact", head: true }),
        supabase.from("crews").select("*", { count: "exact", head: true }),
        supabase.from("live_box").select("*", { count: "exact", head: true }),
        supabase
            .from("contents")
            .select("*", { count: "exact", head: true })
            .in("status", ["approved", "ended"]),
        supabase
            .from("streamer_registration_requests")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
        supabase
            .from("streamer_info_edit_requests")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
        supabase
            .from("entity_info_edit_requests")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
        supabase
            .from("entity_report_requests")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
        supabase
            .from("error_reports")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
        supabase
            .from("live_box_requests")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
        supabase
            .from("contents")
            .select("*", { count: "exact", head: true })
            .eq("status", "pending"),
        supabase
            .from("profiles")
            .select("created_at, provider")
            .gte("created_at", trendStart.toISOString()),
    ]);

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

    const signupTrend = signupRowsError
        ? buildSignupTrend(null, trendDays)
        : buildSignupTrend(
            (signupRows || []) as Array<{ created_at: string; provider: string | null }>,
            trendDays
        );

    return {
        totalUsers: totalUsers || 0,
        emailUsers,
        googleUsers,
        kakaoUsers,
        totalStreamers: totalStreamers || 0,
        totalGroups: totalGroups || 0,
        totalCrews: totalCrews || 0,
        totalLiveBoxes: totalLiveBoxes || 0,
        totalContents: totalContents || 0,
        pendingStreamerRequests: pendingStreamerRequests || 0,
        pendingInfoEditRequests:
            (pendingStreamerInfoEditRequests || 0) + (pendingEntityInfoEditRequests || 0),
        pendingReportRequests: pendingReportRequests || 0,
        pendingHomepageErrorReports: pendingHomepageErrorReports || 0,
        pendingLiveBoxRequests: pendingLiveBoxRequests || 0,
        pendingContentRequests: pendingContentRequests || 0,
        signupTrend,
    };
}

/** 전체 유저 목록을 최신 가입순으로 조회한다 */
export async function fetchUsers(): Promise<Profile[]> {
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
}

/** 유저 정보(닉네임, 역할, 소개)를 수정한다 */
export async function updateUser(
    userId: string,
    updates: { nickname?: string; role?: string; bio?: string }
) {
    const validatedNickname = validateNicknameInput(updates.nickname);

    if (validatedNickname !== undefined) {
        const { error: nicknameError } = await supabase.rpc("assign_profile_nickname_code", {
            p_user_id: userId,
            p_nickname: validatedNickname,
        });
        if (nicknameError) throw nicknameError;
    }

    const updatePayload: { role?: string; bio?: string; updated_at: string } = {
        updated_at: new Date().toISOString(),
    };

    if (updates.role !== undefined) updatePayload.role = updates.role;
    if (updates.bio !== undefined) updatePayload.bio = updates.bio;

    const shouldUpdateProfileColumns =
        updates.role !== undefined || updates.bio !== undefined;

    if (shouldUpdateProfileColumns) {
        const { error: updateError } = await supabase
            .from("profiles")
            .update(updatePayload)
            .eq("id", userId);
        if (updateError) throw updateError;
    }

    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) throw error;
    return data;
}

/** 유저를 삭제한다 (서버 API를 통해 참조 데이터 정리 + Auth 삭제) */
export async function deleteUser(userId: string) {
    const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.message || "회원 삭제에 실패했습니다.");
    }
}
