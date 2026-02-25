import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateLiveBoxRequestStatus } from "@/api/admin-live-box-requests";

export function useUpdateLiveBoxRequestStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      status,
      reviewNote,
    }: {
      requestId: number;
      status: "approved" | "rejected";
      reviewNote?: string;
    }) => updateLiveBoxRequestStatus(requestId, status, reviewNote),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "pending-live-box-requests"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "dashboard-stats"],
      });

      if (variables.status === "approved") {
        toast.success("박스 등록 요청을 확인 처리했습니다.");
      } else {
        toast.success("박스 등록 요청을 거절했습니다.");
      }
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "요청 처리에 실패했습니다.";
      toast.error(message);
    },
  });
}
