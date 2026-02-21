import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MIN_GIFT_POINT = 1;
const MAX_GIFT_POINT = 50;

function getKstDateString() {
  const date = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(date);
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function creditGiftPoint(admin: any, userId: string, amount: number) {
  const { data: current } = await admin
    .from("heart_points")
    .select("point")
    .eq("id", userId)
    .maybeSingle();

  const currentPoint = current?.point || 0;
  const afterPoint = currentPoint + amount;

  const { error: upsertError } = await admin.from("heart_points").upsert({
    id: userId,
    point: afterPoint,
    updated_at: new Date().toISOString(),
  });
  if (upsertError) throw upsertError;

  const { error: historyError } = await admin.from("heart_point_history").insert({
    user_id: userId,
    amount,
    type: "daily_gift_box",
    description: "일일 선물 이벤트",
    after_point: afterPoint,
  });
  if (historyError) throw historyError;

  return afterPoint;
}

export async function POST() {
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

  const admin = createAdminClient(supabaseUrl, serviceRoleKey);
  const today = getKstDateString();

  try {
    let { data: claimRow, error: findError } = await (admin as any)
      .from("daily_gift_box_claims")
      .select("id,amount,credited_at")
      .eq("user_id", user.id)
      .eq("claim_date", today)
      .maybeSingle();

    if (findError && findError.code !== "42P01") throw findError;

    if (!claimRow) {
      const amount = randomInt(MIN_GIFT_POINT, MAX_GIFT_POINT);
      const { data: inserted, error: insertError } = await (admin as any)
        .from("daily_gift_box_claims")
        .insert({
          user_id: user.id,
          claim_date: today,
          amount,
        })
        .select("id,amount,credited_at")
        .single();

      if (insertError) {
        if (insertError.code === "23505") {
          const { data: retryRow, error: retryError } = await (admin as any)
            .from("daily_gift_box_claims")
            .select("id,amount,credited_at")
            .eq("user_id", user.id)
            .eq("claim_date", today)
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
      afterPoint = await creditGiftPoint(admin, user.id, claimRow.amount);
      const { error: markError } = await (admin as any)
        .from("daily_gift_box_claims")
        .update({ credited_at: new Date().toISOString() })
        .eq("id", claimRow.id);
      if (markError) throw markError;
    } else {
      const { data: heartPointRow } = await (admin as any)
        .from("heart_points")
        .select("point")
        .eq("id", user.id)
        .maybeSingle();
      afterPoint = heartPointRow?.point ?? 0;
    }

    return NextResponse.json({
      claimedToday: true,
      amount: claimRow.amount,
      afterPoint,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "선물 이벤트 처리에 실패했습니다.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
