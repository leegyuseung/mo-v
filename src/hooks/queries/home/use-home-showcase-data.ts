import { useQuery } from "@tanstack/react-query";
import { fetchHomeShowcaseData } from "@/api/home";

export function useHomeShowcaseData() {
  return useQuery({
    queryKey: ["home", "showcase-data"],
    queryFn: fetchHomeShowcaseData,
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchOnMount: "always",
  });
}
