import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createLiveBox } from "@/api/admin-live-box";
import type { LiveBoxCreateInput } from "@/types/live-box";

export function useCreateLiveBox() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LiveBoxCreateInput) => createLiveBox(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "live-box"] });
      toast.success("박스가 추가되었습니다.");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "박스 추가에 실패했습니다.";
      toast.error(message);
    },
  });
}
