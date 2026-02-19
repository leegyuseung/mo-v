import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteIdolGroup } from "@/api/admin-groups";
import { toast } from "sonner";

export function useDeleteIdolGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: number) => deleteIdolGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "idol-groups"] });
      toast.success("그룹이 삭제되었습니다.");
    },
    onError: () => {
      toast.error("그룹 삭제에 실패했습니다.");
    },
  });
}
