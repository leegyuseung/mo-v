import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateStreamer } from "@/api/admin-streamers";
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
                crew_name?: string[] | null;
                birthday?: string | null;
                nationality?: string | null;
                gender?: string | null;
                genre?: string[] | null;
                first_stream_date?: string | null;
                fandom_name?: string | null;
                mbti?: string | null;
                alias?: string[] | null;
                platform_url?: string | null;
                fancafe_url?: string | null;
                youtube_url?: string | null;
            };
        }) => updateStreamer(streamerId, updates),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "streamers"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "dashboard-stats"] });
            toast.success("정보가 수정되었습니다.");
        },
        onError: () => {
            toast.error("정보 수정에 실패했습니다.");
        },
    });
}
