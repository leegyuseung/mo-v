import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createIdolGroup } from "@/api/admin-groups";
import type { IdolGroupUpsertInput } from "@/types/group";
import { toast } from "sonner";

export function useCreateIdolGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: IdolGroupUpsertInput) => createIdolGroup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "idol-groups"] });
      toast.success("그룹이 추가되었습니다.");
    },
    onError: () => {
      toast.error("그룹 추가에 실패했습니다.");
    },
  });
}
