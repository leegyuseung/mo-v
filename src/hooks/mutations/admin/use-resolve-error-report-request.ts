import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ADMIN_ERROR_REPORT_REWARD_POINT } from "@/lib/constant";
import { resolveErrorReportRequest } from "@/api/admin-error-reports";

export function useResolveErrorReportRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requestId, action }: { requestId: number; action: "approve" | "reject" }) =>
      resolveErrorReportRequest(requestId, action),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "pending-error-reports"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard-stats"] });

      if (variables.action === "approve") {
        toast.success(
          `오류 신고를 확인 처리했습니다. 신고자에게 ${ADMIN_ERROR_REPORT_REWARD_POINT}하트가 지급되었습니다.`
        );
      } else {
        toast.success("오류 신고를 거절 처리했습니다.");
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "오류 신고 처리에 실패했습니다.");
    },
  });
}
