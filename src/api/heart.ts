import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import type {
    GiftHeartToStreamerResult,
    DonorPeriod,
    HeartRankPeriod,
    StreamerHeartLeaderboardItem,
} from "@/types/heart";

/** 클라이언트 환경에서만 초기화되는 Supabase 인스턴스. 서버에서 모듈이 import되어도 즉시 초기화되지 않는다 */
let _defaultClient: ReturnType<typeof createClient> | null = null;
function getDefaultClient() {
  if (!_defaultClient) _defaultClient = createClient();
  return _defaultClient;
}

function getSeoulCurrentYearRange() {
    const now = new Date();
    const currentYear = Number(
        new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Seoul",
            year: "numeric",
        }).format(now)
    );
    const startIso = new Date(`${currentYear}-01-01T00:00:00+09:00`).toISOString();
    const endIso = new Date(`${currentYear + 1}-01-01T00:00:00+09:00`).toISOString();
    return { startIso, endIso };
}

async function fetchYearlyHeartLeaderboardFromHistory(
    supabase: SupabaseClient,
    limit: number
): Promise<StreamerHeartLeaderboardItem[]> {
    const { startIso, endIso } = getSeoulCurrentYearRange();

    const { data: historyRows, error: historyError } = await supabase
        .from("streamer_heart_history")
        .select("to_streamer_id,amount")
        .gte("created_at", startIso)
        .lt("created_at", endIso);

    if (historyError) throw historyError;
    if (!historyRows || historyRows.length === 0) return [];

    const totalByStreamerId = new Map<number, number>();
    historyRows.forEach((row) => {
        const streamerId = row.to_streamer_id;
        const amount = Number(row.amount || 0);
        if (!Number.isFinite(streamerId) || streamerId <= 0) return;
        totalByStreamerId.set(streamerId, (totalByStreamerId.get(streamerId) || 0) + amount);
    });

    const sortedTotals = Array.from(totalByStreamerId.entries())
        .map(([streamerId, totalReceived]) => ({ streamerId, totalReceived }))
        .filter((item) => item.totalReceived > 0)
        .sort((a, b) => b.totalReceived - a.totalReceived)
        .slice(0, limit);

    if (sortedTotals.length === 0) return [];

    const topStreamerIds = sortedTotals.map((item) => item.streamerId);
    const { data: streamerRows, error: streamerError } = await supabase
        .from("streamers")
        .select("id,nickname,platform,image_url,public_id,group_name,crew_name")
        .in("id", topStreamerIds);

    if (streamerError) throw streamerError;

    const streamerById = new Map((streamerRows || []).map((streamer) => [streamer.id, streamer]));

    return sortedTotals
        .map((item) => {
            const streamer = streamerById.get(item.streamerId);
            if (!streamer) return null;
            return {
                streamer_id: item.streamerId,
                nickname: streamer.nickname,
                platform: streamer.platform,
                total_received: item.totalReceived,
                image_url: streamer.image_url,
                public_id: streamer.public_id,
                group_name: streamer.group_name,
                crew_name: streamer.crew_name,
            };
        })
        .filter((item): item is StreamerHeartLeaderboardItem => item !== null);
}

async function fetchYearlyHeartLeaderboardViaApi(
    limit: number
): Promise<StreamerHeartLeaderboardItem[]> {
    const response = await fetch(`/api/heart/yearly-leaderboard?limit=${limit}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
        throw new Error("연간 하트 랭킹 조회에 실패했습니다.");
    }

    const data = (await response.json()) as StreamerHeartLeaderboardItem[];
    return data || [];
}

/** 유저의 하트 포인트 잔액을 조회한다 */
export async function fetchHeartPoints(userId: string) {
    const { data, error } = await getDefaultClient()
        .from("heart_points")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) throw error;
    return data;
}

/** 유저에게 하트 포인트를 추가하고 히스토리를 기록한다 (upsert 방식) */
export async function addHeartPoints(
    userId: string,
    points: number,
    type: string = "etc",
    description?: string
) {
    // 현재 포인트 조회 (없으면 null)
    const { data: current } = await getDefaultClient()
        .from("heart_points")
        .select("point")
        .eq("id", userId)
        .maybeSingle();

    const currentPoints = current?.point || 0;
    const newPoints = currentPoints + points;

    // upsert: 행이 없으면 생성, 있으면 업데이트
    const { data, error } = await getDefaultClient()
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
    await getDefaultClient().from("heart_point_history").insert({
        user_id: userId,
        amount: points,
        type,
        description: description || null,
        after_point: newPoints,
    });

    return data;
}

/** 유저의 하트 포인트 사용·적립 이력을 페이징 조회한다 */
export async function fetchHeartPointHistory(
    userId: string,
    limit: number = 20,
    offset: number = 0
) {
    const { data, error, count } = await getDefaultClient()
        .from("heart_point_history")
        .select("*", { count: "exact" })
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data: data || [], count: count || 0 };
}

/** 유저가 버츄얼에게 하트를 선물한다 (RPC 호출) */
export async function giftHeartToStreamer(
    fromUserId: string,
    toStreamerId: number,
    amount: number,
    description?: string
): Promise<GiftHeartToStreamerResult> {
    if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("선물 하트 수량은 1 이상이어야 합니다.");
    }

    const { data, error } = await getDefaultClient().rpc("gift_heart_to_streamer", {
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

/** 전체 하트 랭킹을 페이징 조회한다 */
export async function fetchStreamerHeartRank(
    limit: number = 20,
    offset: number = 0
) {
    const { data, error, count } = await getDefaultClient()
        .from("streamer_heart_rank")
        .select("*", { count: "exact" })
        .order("rank", { ascending: true })
        .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data: data || [], count: count || 0 };
}

/** 기간별(전체/연간/주간/월간) 하트 리더보드 상위 N명을 조회한다. 서버에서 호출 시 Supabase 클라이언트를 주입할 수 있다 */
export async function fetchStreamerHeartLeaderboard(
    period: HeartRankPeriod,
    limit: number = 5,
    client?: SupabaseClient
): Promise<StreamerHeartLeaderboardItem[]> {
    if (period === "yearly") {
        if (!client) {
            return fetchYearlyHeartLeaderboardViaApi(limit);
        }
    }

    const supabase = client || getDefaultClient();
    if (period === "yearly") {
        return fetchYearlyHeartLeaderboardFromHistory(supabase, limit);
    }

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
        .select("id,image_url,public_id,group_name,crew_name")
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
                group_name: streamer?.group_name ?? null,
                crew_name: streamer?.crew_name ?? null,
            };
        })
        .filter((item): item is StreamerHeartLeaderboardItem => item !== null);
}

/** 특정 버츄얼의 기간별 후원 랭킹(TOP N)을 조회한다 */
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

    const { data, error, count } = await getDefaultClient()
        .from(source as "streamer_top_donors")
        .select("*", { count: "exact" })
        .eq("streamer_id", streamerId)
        .order("donor_rank", { ascending: true })
        .range(offset, offset + limit - 1);

    if (error) throw error;
    return { data: data || [], count: count || 0 };
}

/** 특정 버츄얼이 받은 하트 총 누적량을 조회한다 */
export async function fetchStreamerReceivedHeartTotal(
    streamerId: number
): Promise<number> {
    const { data, error } = await getDefaultClient()
        .from("streamer_hearts")
        .select("total_received")
        .eq("streamer_id", streamerId)
        .maybeSingle();

    if (error) throw error;
    return data?.total_received ?? 0;
}
