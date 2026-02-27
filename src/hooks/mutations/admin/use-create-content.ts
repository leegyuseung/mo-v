import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createAdminContent } from "@/api/admin-contents";
import type { ContentCreateInput } from "@/types/content";

export function useCreateContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ContentCreateInput) => createAdminContent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "contents"] });
      toast.success("콘텐츠가 추가되었습니다.");
    },
    onError: (error) => {
      const rawMessage = error instanceof Error ? error.message : "콘텐츠 추가에 실패했습니다.";

      if (rawMessage.includes("contents_application_url_check")) {
        toast.error("신청링크는 http:// 또는 https:// 형식이어야 합니다.");
        return;
      }

      if (rawMessage.includes("contents_min_participants_check")) {
        toast.error("최소모집인원은 0 이상이어야 합니다. DB 체크 제약도 함께 확인해 주세요.");
        return;
      }

      toast.error(rawMessage);
    },
  });
}
