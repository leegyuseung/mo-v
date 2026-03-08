import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { creditHeartPointsAtomic } from "@/utils/credit-heart-points";
import { getCurrentKstGiftBoxWindow } from "@/utils/gift-box-window";
import { getUserAccountAccessResult } from "@/utils/server-account-status";
import { consumeRouteRateLimit, getRequestClientIp } from "@/utils/route-rate-limit";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MIN_GIFT_POINT = 1;
const MAX_GIFT_POINT = 50;

function resolveGiftBoxClaimErrorMessage(error: unknown) {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code?: unknown }).code ?? "");
    if (code === "42P01") return "선물 이벤트 테이블이 아직 준비되지 않았습니다.";
  }
  return "선물 이벤트 처리에 실패했습니다. 잠시 후 다시 시도해 주세요.";
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function POST(request: Request) {
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

  const rateLimit = consumeRouteRateLimit({
    key: `gift-box-claim:${user.id}:${getRequestClientIp(request)}`,
    limit: 10,
    windowMs: 60 * 1000,
  });

  if (!rateLimit.ok) {
    return NextResponse.json(
      { message: "요청이 많습니다. 잠시 후 다시 시도해 주세요." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const access = await getUserAccountAccessResult(supabase, user.id);
  if (!access.ok) {
    return NextResponse.json({ message: access.message }, { status: access.status });
  }

  const admin = createAdminClient(supabaseUrl, serviceRoleKey);
  const window = getCurrentKstGiftBoxWindow();

  try {
    const { data: initialClaimRow, error: findError } = await admin
      .from("daily_gift_box_claims")
      .select("id,amount,credited_at")
      .eq("user_id", user.id)
      .eq("claim_window_key", window.windowKey)
      .maybeSingle();
    let claimRow = initialClaimRow;

    if (findError && findError.code !== "42P01") throw findError;

    if (!claimRow) {
      const amount = randomInt(MIN_GIFT_POINT, MAX_GIFT_POINT);
      const { data: inserted, error: insertError } = await admin
        .from("daily_gift_box_claims")
        .insert({
          user_id: user.id,
          claim_date: window.dateKey,
          claim_window_key: window.windowKey,
          amount,
        })
        .select("id,amount,credited_at")
        .single();

      if (insertError) {
        if (insertError.code === "23505") {
          const { data: retryRow, error: retryError } = await admin
            .from("daily_gift_box_claims")
            .select("id,amount,credited_at")
            .eq("user_id", user.id)
            .eq("claim_window_key", window.windowKey)
            .single();
          if (retryError) throw retryError;
          claimRow = retryRow;
        } else {
          throw insertError;
        }
      } else {
        claimRow = inserted;
      }
    }

    if (!claimRow) {
      throw new Error("선물 이벤트 처리에 실패했습니다.");
    }

    let afterPoint: number | null = null;

    if (!claimRow.credited_at) {
      const creditedAt = new Date().toISOString();
      // 선점 시도: credited_at이 null일 때만 업데이트 수행
      const { data: updated, error: markError } = await admin
        .from("daily_gift_box_claims")
        .update({ credited_at: creditedAt })
        .eq("id", claimRow.id)
        .is("credited_at", null)
        .select("id")
        .maybeSingle();

      if (markError) throw markError;

      if (updated) {
        // 선점 성공 (= 내가 최초 처리자) -> 포인트 지급!
        try {
          afterPoint = await creditHeartPointsAtomic(admin, {
            userId: user.id,
            amount: claimRow.amount,
            type: "daily_gift_box",
            description: "선물 이벤트",
          });
        } catch (creditError) {
          // 지급 실패 시 재시도를 허용하기 위해 선점 마킹을 되돌린다.
          await admin
            .from("daily_gift_box_claims")
            .update({ credited_at: null })
            .eq("id", claimRow.id)
            .eq("credited_at", creditedAt);
          throw creditError;
        }
      } else {
        // 선점 실패 (이미 다른 스레드가 먼저 업데이트 했거나 완료 됨) 
        // -> 현재 포인트만 조회해서 반환
        const { data: heartPointRow } = await admin
          .from("heart_points")
          .select("point")
          .eq("id", user.id)
          .maybeSingle();
        afterPoint = heartPointRow?.point ?? 0;
      }
    } else {
      const { data: heartPointRow } = await admin
        .from("heart_points")
        .select("point")
        .eq("id", user.id)
        .maybeSingle();
      afterPoint = heartPointRow?.point ?? 0;
    }

    return NextResponse.json({
      claimedInCurrentWindow: true,
      windowKey: window.windowKey,
      windowLabel: window.windowLabel,
      amount: claimRow.amount,
      afterPoint,
    });
  } catch (error) {
    console.error("gift-box claim failed", error);
    const message = resolveGiftBoxClaimErrorMessage(error);
    return NextResponse.json({ message }, { status: 500 });
  }
}
