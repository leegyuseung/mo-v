import { useMutation } from "@tanstack/react-query";
import { toggleContentFavorite } from "@/api/contents";

export function useToggleContentFavorite() {
  return useMutation({
    mutationFn: (contentId: number) => toggleContentFavorite(contentId),
  });
}
