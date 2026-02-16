import { useQuery } from "@tanstack/react-query";
import { fetchLiveStreamers } from "@/api/live";

export function useLiveStreamers() {
  return useQuery({
    queryKey: ["live-streamers"],
    queryFn: fetchLiveStreamers,
  });
}
