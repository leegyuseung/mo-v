import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getCurrentKstGiftBoxWindow } from "@/utils/gift-box-window";
import { getUserAccountAccessResult } from "@/utils/server-account-status";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function resolveGiftBoxStatusErrorMessage(errorCode: string | null | undefined) {
  if (errorCode === "42P01") {
    return "선물 이벤트 테이블이 아직 준비되지 않았습니다.";
  }
  return "선물 이벤트 상태를 확인하지 못했습니다.";
}

export async function GET() {
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return NextResponse.json({ message: "서버 설정이 올바르지 않습니다." }, { status: 500 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const access = await getUserAccountAccessResult(supabase, user.id);
  if (!access.ok) {
    return NextResponse.json({ message: access.message }, { status: access.status });
  }

  const admin = createAdminClient(supabaseUrl, serviceRoleKey);
  const window = getCurrentKstGiftBoxWindow();

  const { data, error } = await admin
    .from("daily_gift_box_claims")
    .select("amount")
    .eq("user_id", user.id)
    .eq("claim_window_key", window.windowKey)
    .maybeSingle();

  if (error) {
    console.error("gift-box status query failed", { code: error.code, message: error.message });
    return NextResponse.json(
      { message: resolveGiftBoxStatusErrorMessage(error.code) },
      { status: 500 }
    );
  }

  return NextResponse.json({
    claimedInCurrentWindow: Boolean(data),
    windowKey: window.windowKey,
    windowLabel: window.windowLabel,
    amount: data?.amount ?? null,
  });
}
