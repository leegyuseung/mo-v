import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { approveLiveBoxRequest } from "@/api/admin-live-box-requests";
import type { ApproveLiveBoxRequestInput } from "@/types/live-box-request";

export function useApproveLiveBoxRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      payload,
    }: {
      requestId: number;
      payload: ApproveLiveBoxRequestInput;
    }) => approveLiveBoxRequest(requestId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "pending-live-box-requests"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "dashboard-stats"],
      });
      queryClient.invalidateQueries({
        queryKey: ["admin", "live-box"],
      });
      toast.success("박스 등록 요청을 승인하고 라이브박스를 생성했습니다.");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "박스 등록 요청 승인에 실패했습니다.";
      toast.error(message);
    },
  });
}
