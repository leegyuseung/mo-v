import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { resolveEntityReportRequest } from "@/api/admin-reports";

export function useResolveEntityReportRequest() {
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
    }) => resolveEntityReportRequest(requestId, action, reviewNote),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "entity-report-requests"],
      });
      if (variables.action === "approve") {
        toast.success("신고를 확인 처리했습니다. 신고자에게 50하트가 지급되었습니다.");
      } else {
        toast.success("신고를 거절 처리했습니다.");
      }
    },
    onError: () => {
      toast.error("신고 처리에 실패했습니다.");
    },
  });
}
