import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resolveStreamerInfoEditRequest } from "@/api/admin-streamers";
import { toast } from "sonner";

export function useResolveStreamerInfoEditRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      action,
      reviewNote,
    }: {
      requestId: number;
      action: "approve" | "reject";
      reviewNote?: string;
    }) => resolveStreamerInfoEditRequest(requestId, action, reviewNote),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "streamer-info-edit-requests"],
      });
      if (variables.action === "approve") {
        toast.success("요청을 확인 처리했습니다. 요청자에게 50하트가 지급되었습니다.");
      } else {
        toast.success("요청을 거절 처리했습니다.");
      }
    },
    onError: () => {
      toast.error("요청 처리에 실패했습니다.");
    },
  });
}
