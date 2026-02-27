import { useMutation } from "@tanstack/react-query";
import { earlyEndContent } from "@/api/contents";

export function useEarlyEndContent() {
  return useMutation({
    mutationFn: (contentId: number) => earlyEndContent(contentId),
  });
}
