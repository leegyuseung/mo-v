import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLiveStreamerStatusesByIds } from "@/api/live";

export function useLiveStreamerStatuses(streamerIds: number[]) {
  const normalizedIds = useMemo(() => {
    const uniqueIds = Array.from(new Set(streamerIds.filter((id) => Number.isFinite(id))));
    return uniqueIds.sort((a, b) => a - b);
  }, [streamerIds]);

  return useQuery({
    queryKey: ["live-streamer-statuses", normalizedIds],
    queryFn: () => fetchLiveStreamerStatusesByIds(normalizedIds),
    enabled: normalizedIds.length > 0,
    staleTime: 20 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
}
