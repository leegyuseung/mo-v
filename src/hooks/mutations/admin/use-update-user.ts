import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUser } from "@/api/admin";
import { toast } from "sonner";
import type { AppRole } from "@/types/app-role";

export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            userId,
            updates,
        }: {
            userId: string;
            updates: { role?: AppRole; bio?: string };
        }) => updateUser(userId, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
            toast.success("유저 정보가 수정되었습니다.");
        },
        onError: (error) => {
            const message =
                error instanceof Error ? error.message : "유저 정보 수정에 실패했습니다.";
            toast.error(message);
        },
    });
}
