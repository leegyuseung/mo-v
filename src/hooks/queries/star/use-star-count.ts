import { useQuery } from "@tanstack/react-query";
import { fetchStarCount } from "@/api/star";
import type { StarTargetType } from "@/types/star";

/** 대상(버츄얼/그룹/소속)의 즐겨찾기 수를 조회한다. */
export function useStarCount(targetId: number | undefined, targetType: StarTargetType) {
  const keyPrefix =
    targetType === "streamer"
      ? "streamer-star-count"
      : targetType === "group"
        ? "group-star-count"
        : "crew-star-count";

  return useQuery({
    queryKey: [keyPrefix, targetId],
    queryFn: () => fetchStarCount(targetId as number, targetType),
    enabled: Boolean(targetId),
  });
}
