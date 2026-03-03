import type { UserAgreementState, UserAgreementStatusResponse } from "@/types/user-agreement";

/** 로그인 유저 약관 동의 상태를 조회한다 */
export async function fetchUserAgreementStatus() {
  const response = await fetch("/api/auth/agreements", {
    method: "GET",
    cache: "no-store",
  });

  const body = (await response.json().catch(() => null)) as UserAgreementStatusResponse | { message?: string } | null;
  if (!response.ok) {
    throw new Error((body as { message?: string } | null)?.message || "약관 동의 상태를 불러오지 못했습니다.");
  }
  return body as UserAgreementStatusResponse;
}

/** 로그인 유저 약관 동의를 저장/갱신한다 */
export async function saveUserAgreements(state: UserAgreementState) {
  const response = await fetch("/api/auth/agreements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(state),
  });

  const body = (await response.json().catch(() => null)) as { message?: string } | null;
  if (!response.ok) {
    throw new Error(body?.message || "약관 동의 저장에 실패했습니다.");
  }
}

/** 로그인 유저 마케팅 수신 동의만 갱신한다 */
export async function updateMarketingAgreement(marketing: boolean) {
  const response = await fetch("/api/auth/agreements", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ marketing }),
  });

  const body = (await response.json().catch(() => null)) as { message?: string } | null;
  if (!response.ok) {
    throw new Error(body?.message || "마케팅 수신 동의 변경에 실패했습니다.");
  }
}
