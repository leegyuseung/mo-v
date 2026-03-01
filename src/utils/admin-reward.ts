import type { SupabaseClient } from "@supabase/supabase-js";
import { creditHeartPointsAtomic } from "@/utils/credit-heart-points";

/**
 * 관리자가 유저의 요청을 처리(확인)했을 때 하트 포인트를 지급하고 히스토리를 생성합니다.
 * @param admin - Supabase Admin 클라이언트
 * @param userId - 포인트를 지급받을 유저 ID
 * @param amount - 지급할 수량
 * @param description - 히스토리에 기록될 내역 설명
 */
export async function creditAdminRewardPoint(
    admin: SupabaseClient,
    userId: string,
    amount: number,
    description: string
) {
    await creditHeartPointsAtomic(admin, {
        userId,
        amount,
        type: "admin_review_reward",
        description,
    });
}
