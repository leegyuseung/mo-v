import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { updateLiveBox } from "@/api/admin-live-box";
import type { LiveBoxUpdateInput } from "@/types/live-box";

export function useUpdateLiveBox() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      liveBoxId,
      payload,
    }: {
      liveBoxId: number;
      payload: LiveBoxUpdateInput;
    }) => updateLiveBox(liveBoxId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "live-box"] });
      toast.success("박스가 수정되었습니다.");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "박스 수정에 실패했습니다.";
      toast.error(message);
    },
  });
}
