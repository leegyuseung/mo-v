import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { deleteLiveBox } from "@/api/admin-live-box";

export function useDeleteLiveBox() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (liveBoxId: number) => deleteLiveBox(liveBoxId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "live-box"] });
      toast.success("박스가 삭제되었습니다.");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "박스 삭제에 실패했습니다.";
      toast.error(message);
    },
  });
}
