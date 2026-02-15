import { useQuery } from "@tanstack/react-query";
import { fetchStreamers } from "@/api/streamers";
import type { StreamerListParams } from "@/types/streamer";

export function useStreamers(params: StreamerListParams) {
  return useQuery({
    queryKey: ["streamers", params],
    queryFn: () => fetchStreamers(params),
    placeholderData: (previousData) => previousData,
  });
}
