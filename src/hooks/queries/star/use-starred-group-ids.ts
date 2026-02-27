import { useQuery } from "@tanstack/react-query";
import { fetchStarredGroupIds } from "@/api/star";

/** 유저가 즐겨찾기한 그룹 ID 목록을 Set 형태로 조회한다. */
export function useStarredGroupIds(userId?: string, initialIds: number[] = []) {
  return useQuery({
    queryKey: ["starred-groups", userId],
    queryFn: async () => new Set(await fetchStarredGroupIds(userId as string)),
    enabled: Boolean(userId),
    initialData: () => new Set(initialIds),
  });
}
