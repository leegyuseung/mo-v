import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteStreamerInfoEditRequest } from "@/api/admin";
import { toast } from "sonner";

export function useDeleteStreamerInfoEditRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: number) => deleteStreamerInfoEditRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "streamer-info-edit-requests"],
      });
      toast.success("요청을 확인 처리했습니다.");
    },
    onError: () => {
      toast.error("요청 처리에 실패했습니다.");
    },
  });
}
