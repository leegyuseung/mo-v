import { useQuery } from "@tanstack/react-query";
import { fetchStreamerHeartLeaderboard } from "@/api/heart";
import type { HeartRankPeriod } from "@/types/heart";

/**
 * 하트 리더보드 (전체/이번달/이번주) 데이터를 가져오는 커스텀 훅
 * @param period 하트 랭킹 기간
 * @param limit 최대로 가져올 데이터 개수 (기본값: 5)
 */
export function useHeartLeaderboard(period: HeartRankPeriod, limit: number = 5) {
    return useQuery({
        queryKey: ["home-heart-rank", period],
        queryFn: () => fetchStreamerHeartLeaderboard(period, limit),
    });
}
