import type { AccountStatus } from "@/types/account-status";
import type { Profile } from "@/types/profile";

export function getEffectiveAccountStatus(profile?: Pick<
  Profile,
  "account_status" | "suspended_until"
> | null): AccountStatus {
  if (!profile) return "active";

  if (
    profile.account_status === "suspended" &&
    profile.suspended_until &&
    new Date(profile.suspended_until).getTime() <= Date.now()
  ) {
    return "active";
  }

  return (profile.account_status as AccountStatus | null) || "active";
}

export function getAccountStatusLabel(status: AccountStatus): string {
  if (status === "suspended") return "정지";
  if (status === "banned") return "영구 정지";
  return "정상";
}

export function getAccountStatusBadgeClassName(status: AccountStatus): string {
  if (status === "suspended") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "banned") {
    return "bg-red-100 text-red-700";
  }

  return "bg-emerald-100 text-emerald-700";
}

export function getAccountRestrictionMessage(
  profile?: Pick<Profile, "account_status" | "suspended_until"> | null
): string | null {
  const status = getEffectiveAccountStatus(profile);

  if (status === "banned") {
    return "운영정책 위반으로 계정이 정지되었습니다.";
  }

  if (status === "suspended" && profile?.suspended_until) {
    return `${new Date(profile.suspended_until).toLocaleString(
      "ko-KR"
    )}까지 계정 이용이 제한되었습니다.`;
  }

  if (status === "suspended") {
    return "현재 계정 이용이 제한되었습니다.";
  }

  return null;
}
