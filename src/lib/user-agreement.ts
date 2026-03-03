import type { UserAgreementState } from "@/types/user-agreement";

export const USER_AGREEMENT_VERSION = {
  terms: "2026-03-03",
  privacy: "2026-03-03",
  thirdParty: "2026-03-03",
  marketing: "2026-03-03",
} as const;

export function hasRequiredUserAgreements(state: UserAgreementState) {
  return state.terms && state.privacy && state.thirdParty;
}

/**
 * 약관 동의 후 복귀할 경로를 검증한다.
 * open redirect 방지를 위해 상대 경로("/")만 허용하고,
 * 프로토콜 상대 URL("//"), 백슬래시("/\"), 위험 프로토콜을 차단한다.
 */
export function sanitizeAgreementNextPath(nextPath: string | null | undefined): string {
  if (!nextPath) return "/";

  const MAX_PATH_LENGTH = 200;
  if (nextPath.length > MAX_PATH_LENGTH) return "/";
  if (!nextPath.startsWith("/")) return "/";
  // 프로토콜 상대 URL 및 백슬래시 경로 차단 (일부 브라우저에서 /\ → // 로 해석)
  if (nextPath.startsWith("//") || nextPath.startsWith("/\\")) return "/";

  return nextPath;
}
