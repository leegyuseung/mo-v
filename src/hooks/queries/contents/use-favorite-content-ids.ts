import { useQuery } from "@tanstack/react-query";
import { fetchFavoriteContentIds } from "@/api/contents";

export function useFavoriteContentIds(enabled: boolean) {
  return useQuery({
    queryKey: ["contents", "favorites"],
    queryFn: fetchFavoriteContentIds,
    enabled,
    staleTime: 30 * 1000,
  });
}
