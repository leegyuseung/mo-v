import { useQuery } from "@tanstack/react-query";
import { fetchPublicLiveBoxById } from "@/api/live-box";

export function useLiveBoxDetail(liveBoxId: number) {
  return useQuery({
    queryKey: ["live-box", "detail", liveBoxId],
    queryFn: () => fetchPublicLiveBoxById(liveBoxId),
    enabled: Number.isFinite(liveBoxId) && liveBoxId > 0,
  });
}
