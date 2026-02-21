/**
 * 관리자가 유저의 요청을 처리(확인)했을 때 하트 포인트를 지급하고 히스토리를 생성합니다.
 * @param admin - Supabase Admin 클라이언트
 * @param userId - 포인트를 지급받을 유저 ID
 * @param amount - 지급할 수량
 * @param description - 히스토리에 기록될 내역 설명
 */
export async function creditAdminRewardPoint(
    admin: any,
    userId: string,
    amount: number,
    description: string
) {
    const { data: current, error: currentError } = await admin
        .from("heart_points")
        .select("point")
        .eq("id", userId)
        .maybeSingle();
    if (currentError) throw currentError;

    const afterPoint = Number(current?.point || 0) + amount;

    const { error: upsertError } = await admin.from("heart_points").upsert({
        id: userId,
        point: afterPoint,
        updated_at: new Date().toISOString(),
    });
    if (upsertError) throw upsertError;

    const { error: historyError } = await admin.from("heart_point_history").insert({
        user_id: userId,
        amount,
        type: "admin_review_reward",
        description,
        after_point: afterPoint,
    });
    if (historyError) throw historyError;
}
