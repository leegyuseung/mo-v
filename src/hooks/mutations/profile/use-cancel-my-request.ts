import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cancelMyRequest } from "@/api/profile-requests";
import type { CombinedRequest } from "@/types/profile";

/** 내 요청 내역에서 pending 요청을 cancelled로 전환한다. */
export function useCancelMyRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      requestId,
      requestKind,
      userId,
    }: {
      requestId: number;
      requestKind: CombinedRequest["kind"];
      userId: string;
    }) => cancelMyRequest({ requestId, requestKind, userId }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["profile", "my-request-history", variables.userId],
      });
      toast.success("요청을 취소했습니다.");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "요청 취소에 실패했습니다.";
      toast.error(message);
    },
  });
}
