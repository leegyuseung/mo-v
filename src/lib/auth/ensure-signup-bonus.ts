import { claimSignUpBonus } from "@/api/auth";

function getSignUpBonusSessionKey(userId: string) {
  return `signup_bonus_checked:${userId}`;
}

/**
 * 동일 세션 내에서 회원가입 보너스 지급 API를 반복 호출하지 않도록 한다.
 * 서버에서 지급 여부를 최종 판정하고, 클라이언트는 호출 빈도만 제한한다.
 */
export async function ensureSignUpBonusClaimedOncePerSession(userId: string) {
  if (typeof window === "undefined") return;

  const sessionKey = getSignUpBonusSessionKey(userId);
  if (sessionStorage.getItem(sessionKey) === "1") {
    return;
  }

  await claimSignUpBonus();
  sessionStorage.setItem(sessionKey, "1");
}
