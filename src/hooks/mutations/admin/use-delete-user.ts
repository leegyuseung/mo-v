import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteUser } from "@/api/admin";
import { toast } from "sonner";

export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (userId: string) => deleteUser(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "dashboard-stats"] });
            toast.success("유저가 삭제되었습니다.");
        },
        onError: () => {
            toast.error("유저 삭제에 실패했습니다.");
        },
    });
}
