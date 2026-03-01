import type { SupabaseClient } from "@supabase/supabase-js";

type CreditHeartPointsParams = {
  userId: string;
  amount: number;
  type: string;
  description: string;
};

function isMissingRpcFunctionError(error: unknown, functionName: string) {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? String(error.code) : "";
  const message = "message" in error ? String(error.message) : "";
  return code === "42883" || message.includes(functionName);
}

async function creditHeartPointsLegacy(
  admin: SupabaseClient,
  params: CreditHeartPointsParams
): Promise<number> {
  const { userId, amount, type, description } = params;

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
    type,
    description,
    after_point: afterPoint,
  });
  if (historyError) throw historyError;

  return afterPoint;
}

/**
 * 하트 포인트 지급 + 이력 기록을 원자적으로 수행한다.
 * DB RPC 미적용 환경에서는 레거시 방식으로 fallback 한다.
 */
export async function creditHeartPointsAtomic(
  admin: SupabaseClient,
  params: CreditHeartPointsParams
): Promise<number> {
  const { userId, amount, type, description } = params;
  const functionName = "credit_heart_points";

  const { data, error } = await admin.rpc(functionName, {
    p_user_id: userId,
    p_amount: amount,
    p_type: type,
    p_description: description,
  });

  if (!error) {
    const row = Array.isArray(data) ? data[0] : data;
    const afterPoint = Number(row?.after_point ?? 0);
    return Number.isFinite(afterPoint) ? afterPoint : 0;
  }

  if (isMissingRpcFunctionError(error, functionName)) {
    return creditHeartPointsLegacy(admin, params);
  }

  throw error;
}
