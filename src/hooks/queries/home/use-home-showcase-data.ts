import { useQuery } from "@tanstack/react-query";
import { fetchHomeShowcaseData } from "@/api/home";

export function useHomeShowcaseData() {
  return useQuery({
    queryKey: ["home", "showcase-data"],
    queryFn: () => fetchHomeShowcaseData(),
    staleTime: 20 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnReconnect: true,
    refetchOnWindowFocus: true,
  });
}
