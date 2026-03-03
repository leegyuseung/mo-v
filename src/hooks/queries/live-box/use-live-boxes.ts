import { useQuery } from "@tanstack/react-query";
import { fetchPublicLiveBoxes } from "@/api/live-box";

export function useLiveBoxes(enabled = true) {
  return useQuery({
    queryKey: ["live-box", "list"],
    queryFn: () => fetchPublicLiveBoxes(),
    enabled,
    staleTime: 20 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
}
