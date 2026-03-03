import { useQuery } from "@tanstack/react-query";
import { fetchHeartPointHistory } from "@/api/heart";

export function getHeartPointHistoryQueryKey(userId?: string) {
  return ["heartPointHistory", userId] as const;
}

/** 유저 하트 포인트 변동 이력을 조회한다. */
export function useHeartPointHistory(userId?: string) {
  return useQuery({
    queryKey: getHeartPointHistoryQueryKey(userId),
    queryFn: () => fetchHeartPointHistory(userId as string),
    enabled: Boolean(userId),
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
}
