import { useQuery } from "@tanstack/react-query";
import { fetchStreamerPeriodRanks } from "@/api/heart";

/** 특정 스트리머의 기간별(전체/연간/월간/주간) 랭크 정보를 조회한다. */
export function useStreamerHeartPeriodRanks(streamerId: number | undefined) {
  return useQuery({
    queryKey: ["streamer-heart-period-ranks", streamerId],
    queryFn: () => fetchStreamerPeriodRanks(streamerId as number),
    enabled: typeof streamerId === "number" && streamerId > 0,
    staleTime: 20 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
}
