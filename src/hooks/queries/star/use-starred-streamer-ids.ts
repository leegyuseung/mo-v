import { useQuery } from "@tanstack/react-query";
import { fetchStarredStreamerIds } from "@/api/star";

/**
 * 유저가 즐겨찾기한 버츄얼들의 ID 목록을 가져오는 커스텀 훅
 * @param userId 조회할 유저의 ID
 */
export function useStarredStreamerIds(userId?: string) {
    return useQuery({
        queryKey: ["home-starred-streamers", userId],
        queryFn: () => fetchStarredStreamerIds(userId!),
        enabled: Boolean(userId),
    });
}
