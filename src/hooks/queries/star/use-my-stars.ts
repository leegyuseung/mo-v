import { useQuery } from "@tanstack/react-query";
import { fetchMyStars } from "@/api/star";

export function useMyStars(userId?: string) {
  return useQuery({
    queryKey: ["my-stars", userId],
    queryFn: () => fetchMyStars(userId!),
    enabled: Boolean(userId),
  });
}
