import { createClient } from "@/utils/supabase/client";
import type { DashboardStats } from "@/types/admin";
import type { Profile } from "@/types/profile";

export type { DashboardStats, Profile };

const supabase = createClient();
const NICKNAME_REGEX = /^[0-9A-Za-z가-힣_]+$/;

function validateNicknameInput(nickname?: string): string | undefined {
    if (nickname === undefined) return undefined;

    const trimmed = nickname.trim();
    if (!trimmed) {
        throw new Error("닉네임은 비어 있을 수 없습니다.");
    }
    if (trimmed.length < 2 || trimmed.length > 15) {
        throw new Error("닉네임은 2자 이상 15자 이하로 입력해 주세요.");
    }
    if (!NICKNAME_REGEX.test(trimmed)) {
        throw new Error("닉네임은 한글/영문/숫자/_ 만 사용할 수 있습니다.");
    }
    return trimmed;
}

/** 관리자 대시보드 통계를 집계하여 반환한다 (유저 수, 스트리머 수, 그룹 수, 가입방식별 분류) */
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

/** 유저를 삭제한다 */
export async function deleteUser(userId: string) {
    const { error } = await supabase.from("profiles").delete().eq("id", userId);
    if (error) throw error;
}
