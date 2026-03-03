import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { creditHeartPointsAtomic } from "@/utils/credit-heart-points";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type SignupBonusClaimRow = {
  id: number;
  amount: number;
  credited_at: string | null;
};

function isDuplicateSignupBonusHistoryError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? String(error.code) : "";
  const message = "message" in error ? String(error.message) : "";
  return code === "23505" && message.includes("signup_bonus");
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
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
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

  const { data: agreement, error: agreementError } = await supabase
    .from("user_agreements")
    .select("terms_accepted,privacy_accepted,third_party_accepted")
    .eq("user_id", user.id)
    .maybeSingle();

  if (agreementError) {
    return NextResponse.json({ message: "약관 동의 상태 조회에 실패했습니다." }, { status: 500 });
  }

  const requiredAccepted = Boolean(
    agreement?.terms_accepted && agreement?.privacy_accepted && agreement?.third_party_accepted
  );
  if (!requiredAccepted) {
    return NextResponse.json({ message: "필수 약관 동의가 필요합니다." }, { status: 400 });
  }

  const admin = createAdminClient(supabaseUrl, serviceRoleKey);

  try {
    let claimRow: SignupBonusClaimRow | null = null;

    const { data: inserted, error: insertError } = await admin
      .from("signup_bonus_claims")
      .insert({ user_id: user.id })
      .select("id,amount,credited_at")
      .single();

    if (insertError) {
      if (insertError.code === "42P01") {
        return NextResponse.json(
          { message: "signup_bonus_claims 테이블이 없습니다. SQL 마이그레이션을 먼저 적용해주세요." },
          { status: 500 }
        );
      }

      if (insertError.code === "23505") {
        const { data: existingRow, error: existingError } = await admin
          .from("signup_bonus_claims")
          .select("id,amount,credited_at")
          .eq("user_id", user.id)
          .single();
        if (existingError) throw existingError;
        claimRow = existingRow as SignupBonusClaimRow;
      } else {
        throw insertError;
      }
    } else {
      claimRow = inserted as SignupBonusClaimRow;
    }

    if (!claimRow) {
      throw new Error("회원가입 보너스 지급 상태를 확인하지 못했습니다.");
    }

    let afterPoint = 0;

    if (!claimRow.credited_at) {
      const creditedAt = new Date().toISOString();
      const { data: marked, error: markError } = await admin
        .from("signup_bonus_claims")
        .update({ credited_at: creditedAt })
        .eq("id", claimRow.id)
        .is("credited_at", null)
        .select("id")
        .maybeSingle();

      if (markError) throw markError;

      if (marked) {
        try {
          afterPoint = await creditHeartPointsAtomic(admin, {
            userId: user.id,
            amount: claimRow.amount,
            type: "signup_bonus",
            description: "회원가입 보너스",
          });
          return NextResponse.json({ ok: true, granted: true, afterPoint });
        } catch (creditError) {
          // 중복 방지 인덱스에 걸린 경우(이미 지급 기록 존재)는 지급 완료로 간주한다.
          if (!isDuplicateSignupBonusHistoryError(creditError)) {
            throw creditError;
          }
        }
      }
    }

    const { data: heartPointRow } = await admin
      .from("heart_points")
      .select("point")
      .eq("id", user.id)
      .maybeSingle();
    afterPoint = Number(heartPointRow?.point || 0);

    return NextResponse.json({ ok: true, granted: false, afterPoint });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "회원가입 보너스 지급 처리에 실패했습니다.";
    return NextResponse.json({ message }, { status: 500 });
  }
}
