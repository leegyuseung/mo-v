import { createClient } from "@/utils/supabase/client";
import type { DashboardSignupTrendPoint, DashboardStats } from "@/types/admin-dashboard";
import type { ManageUserSanctionPayload } from "@/types/account-status";
import type { AppRole } from "@/types/app-role";
import type { AdminUserProfile, Profile, UserSanctionSummary } from "@/types/profile";
import { normalizeRole } from "@/utils/role";

export type { DashboardStats, Profile };

const supabase = createClient();

function formatSanctionActorLabel(profile?: {
    nickname?: string | null;
    nickname_code?: string | null;
    email?: string | null;
} | null) {
    if (!profile) return null;

    if (profile.nickname) {
        return profile.nickname_code
            ? `${profile.nickname} #${profile.nickname_code}`
            : profile.nickname;
    }

    return profile.email || null;
}

type SanctionProfileSummary = {
    email: string | null;
    nickname: string | null;
    nickname_code: string | null;
    role?: string | null;
};

function coerceUserSanctions(data: unknown): UserSanctionSummary[] {
    return (data || []) as unknown as UserSanctionSummary[];
}

async function fetchProfilesByIds(userIds: string[]) {
    if (userIds.length === 0) {
        return new Map<string, SanctionProfileSummary>();
    }

    const { data } = await supabase
        .from("profiles")
        .select("id,nickname,nickname_code,email,role")
        .in("id", userIds);

    return new Map(
        (data || []).map((profile) => [profile.id, profile] as const)
    );
}

async function fetchCurrentOperatorRole() {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    return normalizeRole(profile?.role);
}

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
        pendingStreamerInfoEditRequests: pendingStreamerInfoEditRequests || 0,
        pendingDataInfoEditRequests: pendingEntityInfoEditRequests || 0,
        pendingReportRequests: pendingReportRequests || 0,
        pendingHomepageErrorReports: pendingHomepageErrorReports || 0,
        pendingLiveBoxRequests: pendingLiveBoxRequests || 0,
        pendingContentRequests: pendingContentRequests || 0,
        signupTrend,
    };
}

/** 전체 유저 목록을 최신 가입순으로 조회한다 */
export async function fetchUsers(): Promise<AdminUserProfile[]> {
    const response = await fetch("/api/admin/users", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    const body = await response.json().catch(() => ([]));

    if (!response.ok) {
        throw new Error(body.message || "유저 목록 조회에 실패했습니다.");
    }

    return (body || []) as AdminUserProfile[];
}

/** 유저 정보(역할, 소개)를 수정한다. 서버 API를 통해 권한 검증 후 처리된다. */
export async function updateUser(
    userId: string,
    updates: { role?: AppRole; bio?: string }
) {
    const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
    });

    const body = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(body.message || "유저 정보 수정에 실패했습니다.");
    }

    return body;
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

/** 유저 정지/해제를 처리한다 */
export async function manageUserSanction(
    userId: string,
    payload: ManageUserSanctionPayload
) {
    const response = await fetch(`/api/admin/users/${userId}/sanction`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    const body = (await response.json().catch(() => null)) as
        Record<string, unknown> | null;

    if (!response.ok) {
        const message = typeof body?.message === "string" ? body.message : "유저 제재 처리에 실패했습니다.";
        throw new Error(message);
    }

    return body;
}

/** 특정 유저의 최근 제재 이력을 조회한다 */
export async function fetchUserSanctions(userId: string): Promise<UserSanctionSummary[]> {
    const operatorRole = await fetchCurrentOperatorRole();
    const sanctionSelectColumns =
        operatorRole === "admin"
            ? "id,user_id,account_status,action_type,duration_days,reason,internal_note,created_at,created_by,suspended_until"
            : "id,user_id,account_status,action_type,duration_days,reason,created_at,created_by,suspended_until";

    const { data, error } = await supabase
        .from("user_sanctions")
        .select(sanctionSelectColumns)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

    if (error) throw error;
    const sanctions = coerceUserSanctions(data);
    const creatorIds = Array.from(new Set(sanctions.map((sanction) => sanction.created_by).filter(Boolean)));

    if (creatorIds.length === 0) {
        return sanctions;
    }

    const creatorsById = await fetchProfilesByIds(creatorIds);

    return sanctions.map((sanction) => ({
        ...sanction,
        created_by_name: formatSanctionActorLabel(
            creatorsById.get(sanction.created_by)
        ),
        created_by_email: creatorsById.get(sanction.created_by)?.email || null,
        created_by_role: creatorsById.get(sanction.created_by)?.role || null,
    }));
}

/** 전체 유저 제재 이력을 최근순으로 조회한다 */
export async function fetchAllUserSanctions(): Promise<UserSanctionSummary[]> {
    const operatorRole = await fetchCurrentOperatorRole();
    const sanctionSelectColumns =
        operatorRole === "admin"
            ? "id,user_id,account_status,action_type,duration_days,reason,internal_note,created_at,created_by,suspended_until"
            : "id,user_id,account_status,action_type,duration_days,reason,created_at,created_by,suspended_until";

    const { data, error } = await supabase
        .from("user_sanctions")
        .select(sanctionSelectColumns)
        .order("created_at", { ascending: false })
        .limit(200);

    if (error) throw error;

    const sanctions = coerceUserSanctions(data);
    const relatedUserIds = Array.from(
        new Set(
            sanctions
                .flatMap((sanction) => [sanction.user_id, sanction.created_by])
                .filter((id): id is string => Boolean(id))
        )
    );
    const profilesById = await fetchProfilesByIds(relatedUserIds);

    return sanctions.map((sanction) => ({
        ...sanction,
        user_name: formatSanctionActorLabel(profilesById.get(sanction.user_id || "")),
        user_email: profilesById.get(sanction.user_id || "")?.email || null,
        user_role: profilesById.get(sanction.user_id || "")?.role || null,
        created_by_name: formatSanctionActorLabel(
            profilesById.get(sanction.created_by)
        ),
        created_by_email: profilesById.get(sanction.created_by)?.email || null,
        created_by_role: profilesById.get(sanction.created_by)?.role || null,
    }));
}
