import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateStreamerRequestStatus } from "@/api/admin-streamers";
import type { StreamerRequestStatus } from "@/types/admin-requests";
import { toast } from "sonner";

export function useUpdateStreamerRequestStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            requestId,
            status,
            reviewNote,
        }: {
            requestId: number;
            status: StreamerRequestStatus;
            reviewNote?: string;
        }) => updateStreamerRequestStatus(requestId, status, reviewNote),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ["admin", "pending-streamer-requests"],
            });

            if (variables.status === "approved") {
                toast.success("등록 요청을 승인했습니다.");
            } else if (variables.status === "rejected") {
                toast.success("등록 요청을 거절했습니다.");
            } else if (variables.status === "cancelled") {
                toast.success("등록 요청을 취소했습니다.");
            } else {
                toast.success("요청 상태를 변경했습니다.");
            }
        },
        onError: () => {
            toast.error("요청 상태 변경에 실패했습니다.");
        },
    });
}
