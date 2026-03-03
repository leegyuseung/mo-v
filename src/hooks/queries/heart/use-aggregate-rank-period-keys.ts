import { useQuery } from "@tanstack/react-query";
import { fetchAggregateRankPeriodKeys } from "@/api/aggregate-rank";
import type { AggregatePeriod, AggregateRankPeriodKey } from "@/types/aggregate-rank";

export function useAggregateRankPeriodKeys(
  period: AggregatePeriod,
  minYear: number = 2026,
  initialData?: AggregateRankPeriodKey[]
) {
  return useQuery({
    queryKey: ["aggregate-rank-period-keys", period, minYear],
    queryFn: () => fetchAggregateRankPeriodKeys(period, minYear),
    initialData,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
