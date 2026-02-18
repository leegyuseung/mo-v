import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateIdolGroup } from "@/api/admin";
import type { IdolGroupUpsertInput } from "@/types/admin";
import { toast } from "sonner";

export function useUpdateIdolGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, payload }: { groupId: number; payload: IdolGroupUpsertInput }) =>
      updateIdolGroup(groupId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "idol-groups"] });
      toast.success("그룹이 수정되었습니다.");
    },
    onError: () => {
      toast.error("그룹 수정에 실패했습니다.");
    },
  });
}
