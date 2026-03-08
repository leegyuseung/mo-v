import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getAccountRestrictionMessage } from "@/utils/account-status";

type ProfileStatusRow = {
  account_status: string;
  suspended_until: string | null;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function getUserAccountAccessResult(
  supabase: any,
  userId: string
) {
  const { data, error } = await supabase
    .from("profiles")
    .select("account_status,suspended_until")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return {
      ok: false,
      status: 500,
      message: "계정 상태 확인에 실패했습니다.",
    } as const;
  }

  const isExpiredSuspension =
    data?.account_status === "suspended" &&
    Boolean(data.suspended_until) &&
    new Date(data.suspended_until as string).getTime() <= Date.now();

  if (isExpiredSuspension) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceRoleKey) {
      const admin = createAdminClient(supabaseUrl, serviceRoleKey);
      await admin
        .from("profiles")
        .update({
          account_status: "active",
          suspended_until: null,
          suspension_reason: null,
          suspension_internal_note: null,
          suspended_at: null,
          suspended_by: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .eq("account_status", "suspended");
    }

    return {
      ok: true,
      status: 200,
      message: null,
    } as const;
  }

  const message = getAccountRestrictionMessage(data);
  if (message) {
    return {
      ok: false,
      status: 403,
      message,
    } as const;
  }

  return {
    ok: true,
    status: 200,
    message: null,
  } as const;
}
