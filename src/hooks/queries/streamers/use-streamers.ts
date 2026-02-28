import { useQuery } from "@tanstack/react-query";
import { fetchStreamers } from "@/api/streamers";
import type { StreamerListParams } from "@/types/streamer";

type UseStreamersOptions = {
  keepPreviousData?: boolean;
};

export function useStreamers(
  params: StreamerListParams,
  options?: UseStreamersOptions
) {
  return useQuery({
    queryKey: ["streamers", params],
    queryFn: () => fetchStreamers(params),
    placeholderData:
      options?.keepPreviousData === false
        ? undefined
        : (previousData) => previousData,
  });
}
