import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteEntityReportRequest } from "@/api/admin-reports";

export function useDeleteEntityReportRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: number) => deleteEntityReportRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "entity-report-requests"],
      });
      toast.success("신고를 확인 처리했습니다.");
    },
    onError: () => {
      toast.error("신고 처리에 실패했습니다.");
    },
  });
}
