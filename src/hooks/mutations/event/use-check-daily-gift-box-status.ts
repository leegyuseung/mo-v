import { useMutation } from "@tanstack/react-query";
import { fetchDailyGiftBoxStatus } from "@/api/event";

/** 선물 이벤트 참여 가능 여부를 확인한다. 버튼 클릭 시점 호출용 mutation 훅 */
export function useCheckDailyGiftBoxStatus() {
  return useMutation({
    mutationFn: fetchDailyGiftBoxStatus,
  });
}
