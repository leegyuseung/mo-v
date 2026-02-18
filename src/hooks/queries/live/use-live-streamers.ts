import { useQuery } from "@tanstack/react-query";
import { fetchLiveStreamers } from "@/api/live";

export function useLiveStreamers() {
  return useQuery({
    queryKey: ["live-streamers"],
    queryFn: fetchLiveStreamers,
    staleTime: 20 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
}
