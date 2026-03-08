import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { manageUserSanction } from "@/api/admin";
import type { ManageUserSanctionPayload } from "@/types/account-status";

export function useManageUserSanction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: ManageUserSanctionPayload;
    }) => manageUserSanction(userId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      toast.success(
        variables.payload.action === "unsuspend"
          ? "유저 정지가 해제되었습니다."
          : "유저 정지가 처리되었습니다."
      );
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "유저 제재 처리에 실패했습니다.";
      toast.error(message);
    },
  });
}
