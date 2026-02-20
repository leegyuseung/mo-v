import { createClient } from "@/utils/supabase/client";
import type { GiftHeartToStreamerResult } from "@/types/heart";

const supabase = createClient();

export type DonorPeriod = "all" | "weekly" | "monthly";
export type HeartRankPeriod = "all" | "weekly" | "monthly";

export type StreamerHeartLeaderboardItem = {
    streamer_id: number;
    nickname: string | null;
    platform: string | null;
    total_received: number;
    image_url: string | null;
    public_id: string | null;
};

export async function fetchHeartPoints(userId: string) {
    const { data, error } = await supabase
        .from("heart_points")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) throw error;
    return data;
}

export async function addHeartPoints(
    userId: string,
    points: number,
    type: string = "etc",
    description?: string
) {
    // 현재 포인트 조회 (없으면 null)
    const { data: current } = await supabase
        .from("heart_points")
        .select("point")
        .eq("id", userId)
        .maybeSingle();

    const currentPoints = current?.point || 0;
    const newPoints = currentPoints + points;

    // upsert: 행이 없으면 생성, 있으면 업데이트
    const { data, error } = await supabase
        .from("heart_points")
        .upsert({
            id: userId,
            point: newPoints,
            updated_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) throw error;

    // 히스토리 기록
    await supabase.from("heart_point_history").insert({
        user_id: userId,
        amount: points,
        type,
        description: description || null,
        after_point: newPoints,
    });

    return data;
}

export async function fetchHeartPointHistory(
    userId: string,
    limit: number = 20,
    offset: number = 0
) {
    const { data, error, count } = await supabase
        .from("heart_point_history")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data: data || [], count: count || 0 };
}

export async function giftHeartToStreamer(
    fromUserId: string,
    toStreamerId: number,
    amount: number,
    description?: string
): Promise<GiftHeartToStreamerResult> {
    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("선물 하트 수량은 1 이상이어야 합니다.");
    }

    const { data, error } = await supabase.rpc("gift_heart_to_streamer", {
        p_from_user_id: fromUserId,
        p_to_streamer_id: toStreamerId,
        p_amount: amount,
        p_description: description || null,
    });

    if (error) throw error;

    const row = Array.isArray(data) ? data[0] : null;
    if (!row) {
        throw new Error("하트 선물 처리 결과를 반환받지 못했습니다.");
    }

    return {
        userAfterPoint: row.user_after_point,
        streamerAfterTotal: row.streamer_after_total,
    };
}

export async function fetchStreamerHeartRank(
    limit: number = 20,
    offset: number = 0
) {
    const { data, error, count } = await supabase
        .from("streamer_heart_rank")
        .select("*", { count: "exact" })
        .order("rank", { ascending: true })
        .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data: data || [], count: count || 0 };
}

export async function fetchStreamerHeartLeaderboard(
    period: HeartRankPeriod,
    limit: number = 5
): Promise<StreamerHeartLeaderboardItem[]> {
    const source =
        period === "weekly"
            ? "streamer_heart_rank_weekly"
            : period === "monthly"
                ? "streamer_heart_rank_monthly"
                : "streamer_heart_rank";

    const { data: rankRows, error: rankError } = await supabase
        .from(source as "streamer_heart_rank")
        .select("streamer_id,nickname,platform,total_received")
        .order("total_received", { ascending: false, nullsFirst: false })
        .order("nickname", { ascending: true })
        .limit(limit);

    if (rankError) throw rankError;

    const rows = rankRows || [];
    const streamerIds = rows
        .map((row) => row.streamer_id)
        .filter((id): id is number => typeof id === "number");

    if (streamerIds.length === 0) return [];

    const { data: streamerRows, error: streamerError } = await supabase
        .from("streamers")
        .select("id,image_url,public_id")
        .in("id", streamerIds);

    if (streamerError) throw streamerError;

    const streamerById = new Map(
        (streamerRows || []).map((streamer) => [streamer.id, streamer])
    );

    return rows
        .map((row) => {
            if (typeof row.streamer_id !== "number") return null;
            const streamer = streamerById.get(row.streamer_id);
            return {
                streamer_id: row.streamer_id,
                nickname: row.nickname,
                platform: row.platform,
                total_received: row.total_received ?? 0,
                image_url: streamer?.image_url ?? null,
                public_id: streamer?.public_id ?? null,
            };
        })
        .filter((item): item is StreamerHeartLeaderboardItem => item !== null);
}

export async function fetchStreamerTopDonors(
    streamerId: number,
    limit: number = 20,
    offset: number = 0,
    period: DonorPeriod = "all"
) {
    const source =
        period === "weekly"
            ? "streamer_top_donors_weekly"
            : period === "monthly"
                ? "streamer_top_donors_monthly"
                : "streamer_top_donors";

    const { data, error, count } = await supabase
        .from(source as "streamer_top_donors")
        .select("*", { count: "exact" })
        .eq("streamer_id", streamerId)
        .order("donor_rank", { ascending: true })
        .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data: data || [], count: count || 0 };
}

export async function fetchStreamerReceivedHeartTotal(
    streamerId: number
): Promise<number> {
    const { data, error } = await supabase
        .from("streamer_hearts")
        .select("total_received")
        .eq("streamer_id", streamerId)
        .maybeSingle();

    if (error) throw error;
    return data?.total_received ?? 0;
}
