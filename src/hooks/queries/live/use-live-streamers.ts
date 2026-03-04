import { useQuery } from "@tanstack/react-query";
import { fetchLiveStreamers } from "@/api/live";

export function useLiveStreamers(enabled = true) {
  return useQuery({
    queryKey: ["live-streamers"],
    queryFn: fetchLiveStreamers,
    enabled,
    staleTime: 20 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
}
