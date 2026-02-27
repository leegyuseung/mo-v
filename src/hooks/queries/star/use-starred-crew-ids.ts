import { useQuery } from "@tanstack/react-query";
import { fetchStarredCrewIds } from "@/api/star";

/** 유저가 즐겨찾기한 소속 ID 목록을 Set 형태로 조회한다. */
export function useStarredCrewIds(userId?: string, initialIds: number[] = []) {
  return useQuery({
    queryKey: ["starred-crews", userId],
    queryFn: async () => new Set(await fetchStarredCrewIds(userId as string)),
    enabled: Boolean(userId),
    initialData: () => new Set(initialIds),
  });
}
