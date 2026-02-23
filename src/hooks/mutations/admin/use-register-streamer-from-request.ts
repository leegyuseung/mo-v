import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerStreamerFromRequest } from "@/api/admin-streamers";
import { toast } from "sonner";

export function useRegisterStreamerFromRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            requestId,
            nickname,
            imageUrl,
            chzzkId,
            soopId,
            groupName,
            crewName,
            birthday,
            nationality,
            gender,
            genre,
            firstStreamDate,
            fandomName,
            mbti,
            alias,
            platformUrl,
            fancafeUrl,
            youtubeUrl,
        }: {
            requestId: number;
            nickname: string;
            imageUrl: string;
            chzzkId: string | null;
            soopId: string | null;
            groupName: string[] | null;
            crewName: string[] | null;
            birthday: string | null;
            nationality: string | null;
            gender: string | null;
            genre: string[] | null;
            firstStreamDate: string | null;
            fandomName: string | null;
            mbti: string | null;
            alias: string[] | null;
            platformUrl: string | null;
            fancafeUrl: string | null;
            youtubeUrl: string | null;
        }) =>
            registerStreamerFromRequest(requestId, {
                nickname,
                imageUrl,
                chzzkId,
                soopId,
                groupName,
                crewName,
                birthday,
                nationality,
                gender,
                genre,
                firstStreamDate,
                fandomName,
                mbti,
                alias,
                platformUrl,
                fancafeUrl,
                youtubeUrl,
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["admin", "pending-streamer-requests"],
            });
            queryClient.invalidateQueries({ queryKey: ["admin", "streamers"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "dashboard-stats"] });
            toast.success("버츄얼이 등록되었습니다.");
        },
        onError: (error) => {
            const message =
                error instanceof Error
                    ? error.message
                    : "버츄얼 등록에 실패했습니다.";
            toast.error(message);
        },
    });
}
