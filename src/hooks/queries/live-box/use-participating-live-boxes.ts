import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchParticipatingPublicLiveBoxes } from "@/api/live-box";

/** 특정 스트리머 플랫폼 ID(chzzk/soop) 기준 참여 라이브박스(대기/진행중)를 조회한다. */
export function useParticipatingLiveBoxes(platformIds: string[]) {
  const normalizedPlatformIds = useMemo(
    () =>
      Array.from(
        new Set(
          platformIds
            .map((value) => value.trim().toLowerCase())
            .filter(Boolean)
        )
      ).sort(),
    [platformIds]
  );

  return useQuery({
    queryKey: ["live-box", "participating", normalizedPlatformIds],
    queryFn: () => fetchParticipatingPublicLiveBoxes(normalizedPlatformIds),
    enabled: normalizedPlatformIds.length > 0,
    staleTime: 20 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
}
