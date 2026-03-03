import { useQuery } from "@tanstack/react-query";
import { fetchAggregateRankSnapshot } from "@/api/aggregate-rank";
import type { AggregatePeriod, AggregateRankSnapshotRow } from "@/types/aggregate-rank";

export function useAggregateRankSnapshot(
  period: AggregatePeriod,
  year: number,
  month: number,
  weekOfMonth: number,
  enabled: boolean = true,
  initialData?: AggregateRankSnapshotRow[]
) {
  return useQuery({
    queryKey: ["aggregate-rank-snapshot", period, year, month, weekOfMonth],
    queryFn: () => fetchAggregateRankSnapshot(period, year, month, weekOfMonth),
    enabled,
    initialData,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}
