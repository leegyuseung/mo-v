import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteAdminContent } from "@/api/admin-contents";

export function useDeleteContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contentId: number) => deleteAdminContent(contentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "contents"] });
      toast.success("콘텐츠가 삭제되었습니다.");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "콘텐츠 삭제에 실패했습니다.";
      toast.error(message);
    },
  });
}
