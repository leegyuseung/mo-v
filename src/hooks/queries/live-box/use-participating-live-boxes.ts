import { useQuery } from "@tanstack/react-query";
import { fetchParticipatingPublicLiveBoxes } from "@/api/live-box";

export function useParticipatingLiveBoxes(platformIds: string[]) {
  const normalizedPlatformIds = Array.from(
    new Set(
      platformIds
        .map((value) => value.trim().toLowerCase())
        .filter(Boolean)
    )
  );

  return useQuery({
    queryKey: ["live-box", "participating", normalizedPlatformIds],
    queryFn: () => fetchParticipatingPublicLiveBoxes(normalizedPlatformIds),
    enabled: normalizedPlatformIds.length > 0,
    staleTime: 20 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
