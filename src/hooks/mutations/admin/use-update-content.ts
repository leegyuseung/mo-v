import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateAdminContent } from "@/api/admin-contents";
import type { ContentUpdateInput } from "@/types/content";

export function useUpdateContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      contentId,
      payload,
    }: {
      contentId: number;
      payload: ContentUpdateInput;
    }) => updateAdminContent(contentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "contents"] });
      toast.success("콘텐츠가 수정되었습니다.");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "콘텐츠 수정에 실패했습니다.";
      toast.error(message);
    },
  });
}
