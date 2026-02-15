import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteStreamer } from "@/api/admin";
import { toast } from "sonner";

export function useDeleteStreamer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (streamerId: number) => deleteStreamer(streamerId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "streamers"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "dashboard-stats"] });
            toast.success("스트리머가 삭제되었습니다.");
        },
        onError: () => {
            toast.error("스트리머 삭제에 실패했습니다.");
        },
    });
}
