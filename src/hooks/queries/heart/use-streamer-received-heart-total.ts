import { useQuery } from "@tanstack/react-query";
import { fetchStreamerReceivedHeartTotal } from "@/api/heart";

/** 특정 버츄얼이 누적 수령한 하트 총량을 조회한다. */
export function useStreamerReceivedHeartTotal(streamerId?: number) {
  return useQuery({
    queryKey: ["streamer-received-heart-total", streamerId],
    queryFn: () => fetchStreamerReceivedHeartTotal(streamerId as number),
    enabled: Boolean(streamerId),
  });
}
