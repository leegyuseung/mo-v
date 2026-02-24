import { useQuery } from "@tanstack/react-query";
import { fetchHeartPointHistory } from "@/api/heart";

/** 유저 하트 포인트 변동 이력을 조회한다. */
export function useHeartPointHistory(userId?: string) {
  return useQuery({
    queryKey: ["heartPointHistory", userId],
    queryFn: () => fetchHeartPointHistory(userId as string),
    enabled: Boolean(userId),
  });
}
