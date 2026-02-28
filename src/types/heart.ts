/** 하트 선물 결과 */
export type GiftHeartToStreamerResult = {
    userAfterPoint: number;
    streamerAfterTotal: number;
};

/** 후원 랭킹 기간 필터 (전체 / 주간 / 월간) */
export type DonorPeriod = "all" | "weekly" | "monthly";

/** 하트 랭킹 기간 필터 (전체 / 주간 / 월간) */
export type HeartRankPeriod = "all" | "weekly" | "monthly";

/** 하트 랭킹 리더보드 항목 */
export type StreamerHeartLeaderboardItem = {
    streamer_id: number;
    nickname: string | null;
    platform: string | null;
    total_received: number;
    image_url: string | null;
    public_id: string | null;
    group_name: string[] | null;
    crew_name: string[] | null;
};
