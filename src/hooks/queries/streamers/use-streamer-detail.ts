import { useQuery } from "@tanstack/react-query";
import { fetchStreamerById } from "@/api/streamers";

export function useStreamerDetail(streamerId: number) {
  return useQuery({
    queryKey: ["streamer", streamerId],
    queryFn: () => fetchStreamerById(streamerId),
    enabled: Number.isFinite(streamerId) && streamerId > 0,
  });
}
