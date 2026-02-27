import { useMutation } from "@tanstack/react-query";
import { trackContentView } from "@/api/contents";

export function useTrackContentView() {
  return useMutation({
    mutationFn: (contentId: number) => trackContentView(contentId),
  });
}
