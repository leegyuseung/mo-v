import { useQuery } from "@tanstack/react-query";
import { fetchHomeBroadcasts } from "@/api/home-broadcast";

export function useHomeBroadcasts() {
  return useQuery({
    queryKey: ["home", "broadcasts"],
    queryFn: fetchHomeBroadcasts,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
}

