import { useMutation } from "@tanstack/react-query";
import { claimDailyGiftBox } from "@/api/event";

/** 선물 상자를 열어 당일 하트 보상을 획득한다. */
export function useClaimDailyGiftBox() {
  return useMutation({
    mutationFn: claimDailyGiftBox,
  });
}
