import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { hasRequiredUserAgreements, USER_AGREEMENT_VERSION } from "@/lib/user-agreement";
import type { UserAgreementState } from "@/types/user-agreement";
import type { SupabaseClient } from "@supabase/supabase-js";

function createUnauthorizedResponse() {
  return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
}

/** Supabase 클라이언트에서 인증된 사용자를 조회하고, 미인증 시 null을 반환한다 */
async function getAuthenticatedUser(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** 로그인 유저의 약관 동의 상태를 조회한다 */
export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const user = await getAuthenticatedUser(supabase);
  if (!user) return createUnauthorizedResponse();

  const { data, error } = await supabase
    .from("user_agreements")
    .select("terms_accepted,privacy_accepted,third_party_accepted,marketing_accepted,agreed_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ message: "약관 동의 상태 조회에 실패했습니다." }, { status: 500 });
  }

  const agreement = data
    ? {
        terms_accepted: Boolean(data.terms_accepted),
        privacy_accepted: Boolean(data.privacy_accepted),
        third_party_accepted: Boolean(data.third_party_accepted),
        marketing_accepted: Boolean(data.marketing_accepted),
        agreed_at: data.agreed_at,
      }
    : null;

  return NextResponse.json({
    hasAgreement: Boolean(agreement),
    requiredAccepted: agreement
      ? hasRequiredUserAgreements({
          terms: agreement.terms_accepted,
          privacy: agreement.privacy_accepted,
          thirdParty: agreement.third_party_accepted,
          marketing: agreement.marketing_accepted,
        })
      : false,
    agreement,
  });
}

/** 로그인 유저의 약관 동의를 저장/갱신한다 (회원가입 직후 또는 소셜 로그인 후 최초 동의) */
export async function POST(request: Request) {
  let payload: UserAgreementState;
  try {
    const body = (await request.json()) as Partial<UserAgreementState>;
    payload = {
      terms: body.terms === true,
      privacy: body.privacy === true,
      thirdParty: body.thirdParty === true,
      marketing: body.marketing === true,
    };
  } catch {
    return NextResponse.json({ message: "잘못된 요청 본문입니다." }, { status: 400 });
  }

  if (!hasRequiredUserAgreements(payload)) {
    return NextResponse.json({ message: "필수 약관 동의가 필요합니다." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const user = await getAuthenticatedUser(supabase);
  if (!user) return createUnauthorizedResponse();

  const agreedAt = new Date().toISOString();
  const { error } = await supabase.from("user_agreements").upsert(
    {
      user_id: user.id,
      terms_accepted: payload.terms,
      privacy_accepted: payload.privacy,
      third_party_accepted: payload.thirdParty,
      marketing_accepted: payload.marketing,
      terms_version: USER_AGREEMENT_VERSION.terms,
      privacy_version: USER_AGREEMENT_VERSION.privacy,
      third_party_version: USER_AGREEMENT_VERSION.thirdParty,
      marketing_version: payload.marketing ? USER_AGREEMENT_VERSION.marketing : null,
      agreed_at: agreedAt,
      updated_at: agreedAt,
    },
    {
      onConflict: "user_id",
    }
  );

  if (error) {
    return NextResponse.json({ message: "약관 동의 저장에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

/** 마케팅 수신 동의만 단독으로 변경한다 (프로필 설정 화면에서 사용) */
export async function PATCH(request: Request) {
  let marketing: boolean;
  try {
    const body = (await request.json()) as { marketing?: unknown };
    if (typeof body.marketing !== "boolean") {
      return NextResponse.json({ message: "marketing 값이 필요합니다." }, { status: 400 });
    }
    marketing = body.marketing;
  } catch {
    return NextResponse.json({ message: "잘못된 요청 본문입니다." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const user = await getAuthenticatedUser(supabase);
  if (!user) return createUnauthorizedResponse();

  const nowIso = new Date().toISOString();
  const { data: existing, error: existingError } = await supabase
    .from("user_agreements")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ message: "약관 동의 상태 조회에 실패했습니다." }, { status: 500 });
  }

  if (!existing) {
    return NextResponse.json({ message: "필수 약관 동의 후 다시 시도해주세요." }, { status: 400 });
  }

  const { error } = await supabase
    .from("user_agreements")
    .update({
      marketing_accepted: marketing,
      marketing_version: marketing ? USER_AGREEMENT_VERSION.marketing : null,
      updated_at: nowIso,
    })
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ message: "마케팅 수신 동의 변경에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, marketing });
}
