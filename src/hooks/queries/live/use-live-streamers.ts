import { useQuery } from "@tanstack/react-query";
import { fetchLiveStreamers } from "@/api/live";

export function useLiveStreamers(enabled = true, liveOnly = false) {
  return useQuery({
    queryKey: ["live-streamers", liveOnly ? "live-only" : "all"],
    queryFn: () => fetchLiveStreamers(liveOnly),
    enabled,
    placeholderData: (previousData) => previousData,
    staleTime: 20 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,
  });
}
