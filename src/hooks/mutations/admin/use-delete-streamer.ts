import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteStreamer } from "@/api/admin-streamers";
import { toast } from "sonner";

export function useDeleteStreamer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (streamerId: number) => deleteStreamer(streamerId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "streamers"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "dashboard-stats"] });
            toast.success("버츄얼이 삭제되었습니다.");
        },
        onError: () => {
            toast.error("버츄얼 삭제에 실패했습니다.");
        },
    });
}
