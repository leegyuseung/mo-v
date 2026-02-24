import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeStar } from "@/api/star";
import type { StarTargetType } from "@/types/star";

type RemoveStarInput = {
  userId: string;
  targetId: number;
  type: StarTargetType;
};

/** 즐겨찾기 삭제 전용 mutation 훅 (일괄 삭제 모드에서 사용) */
export function useRemoveStar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, targetId, type }: RemoveStarInput) =>
      removeStar(userId, targetId, type),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["my-stars", variables.userId] });
    },
  });
}
