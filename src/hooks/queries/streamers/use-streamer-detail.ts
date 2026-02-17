import { useQuery } from "@tanstack/react-query";
import { fetchStreamerByPublicId } from "@/api/streamers";

export function useStreamerDetail(streamerPublicId: string) {
  return useQuery({
    queryKey: ["streamer", streamerPublicId],
    queryFn: () => fetchStreamerByPublicId(streamerPublicId),
    enabled: streamerPublicId.trim().length > 0,
  });
}
