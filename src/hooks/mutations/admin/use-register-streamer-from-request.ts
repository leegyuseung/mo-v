import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerStreamerFromRequest } from "@/api/admin";
import { toast } from "sonner";

export function useRegisterStreamerFromRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            requestId,
            nickname,
            imageUrl,
            groupName,
        }: {
            requestId: number;
            nickname: string;
            imageUrl: string;
            groupName: string[] | null;
        }) => registerStreamerFromRequest(requestId, { nickname, imageUrl, groupName }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["admin", "pending-streamer-requests"],
            });
            queryClient.invalidateQueries({ queryKey: ["admin", "streamers"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "dashboard-stats"] });
            toast.success("스트리머가 등록되었습니다.");
        },
        onError: (error) => {
            const message =
                error instanceof Error
                    ? error.message
                    : "스트리머 등록에 실패했습니다.";
            toast.error(message);
        },
    });
}
