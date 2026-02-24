import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { isStarred, addStar, removeStar } from "@/api/star";
import type { StarTargetType } from "@/types/star";

/**
 * 즐겨찾기 토글 로직을 공통화한 훅.
 * 버츄얼·그룹·크루 디테일 화면에서 동일한 패턴(optimistic update → insert/delete → invalidate)을 제거한다.
 */
export function useToggleStar(type: StarTargetType, targetId: number | undefined) {
    const { user } = useAuthStore();
    const queryClient = useQueryClient();
    const [isToggling, setIsToggling] = useState(false);

    const queryKey = ["star", type, user?.id, targetId] as const;
    const countQueryKey =
        type === "streamer"
            ? (["streamer-star-count", targetId] as const)
            : type === "group"
                ? (["group-star-count", targetId] as const)
                : (["crew-star-count", targetId] as const);

    const { data: starred = false } = useQuery({
        queryKey,
        queryFn: () => isStarred(user!.id, targetId!, type),
        enabled: Boolean(user?.id && targetId),
    });

    const toggle = async () => {
        if (!user) {
            toast.error("로그인 후 즐겨찾기를 사용할 수 있습니다.");
            return;
        }
        if (!targetId || isToggling) return;

        setIsToggling(true);
        const previous = queryClient.getQueryData<boolean>(queryKey) ?? false;
        const next = !previous;
        queryClient.setQueryData(queryKey, next);
        const previousCount = queryClient.getQueryData<number>(countQueryKey);
        if (typeof previousCount === "number") {
            queryClient.setQueryData<number>(countQueryKey, Math.max(0, previousCount + (next ? 1 : -1)));
        }

        try {
            if (next) {
                await addStar(user.id, targetId, type);
            } else {
                await removeStar(user.id, targetId, type);
            }
            await queryClient.invalidateQueries({ queryKey: ["my-stars", user.id] });
        } catch (error) {
            queryClient.setQueryData(queryKey, previous);
            if (typeof previousCount === "number") {
                queryClient.setQueryData<number>(countQueryKey, previousCount);
            }
            const message =
                error instanceof Error ? error.message : "즐겨찾기 처리에 실패했습니다.";
            toast.error(message);
        } finally {
            setIsToggling(false);
        }
    };

    return { starred, isToggling, toggle };
}
