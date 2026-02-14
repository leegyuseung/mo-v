import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateStreamer } from "@/api/admin";
import { toast } from "sonner";

export function useUpdateStreamer() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            streamerId,
            updates,
        }: {
            streamerId: number;
            updates: {
                nickname?: string;
                platform?: string;
                chzzk_id?: string | null;
                soop_id?: string | null;
                image_url?: string | null;
                group_name?: string[] | null;
            };
        }) => updateStreamer(streamerId, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "streamers"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "dashboard-stats"] });
            toast.success("스트리머 정보가 수정되었습니다.");
        },
        onError: () => {
            toast.error("스트리머 정보 수정에 실패했습니다.");
        },
    });
}
