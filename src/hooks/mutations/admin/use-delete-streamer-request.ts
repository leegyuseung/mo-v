import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteStreamerRequest } from "@/api/admin";
import { toast } from "sonner";

export function useDeleteStreamerRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: number) => deleteStreamerRequest(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin", "pending-streamer-requests"],
      });
      toast.success("요청이 삭제되었습니다.");
    },
    onError: () => {
      toast.error("요청 삭제에 실패했습니다.");
    },
  });
}
