export const ACCOUNT_RESTRICTED_STORAGE_KEY = "account_restricted_redirect";
export const ACCOUNT_RESTRICTED_COOKIE_KEY = "account_restricted_payload";

export type AccountRestrictedPayload = {
  reason?: string;
  status?: string;
  suspended_until?: string;
};

export function parseAccountRestrictedPayload(raw: string) {
  try {
    return JSON.parse(decodeURIComponent(raw)) as AccountRestrictedPayload;
  } catch {
    return null;
  }
}

export function getAccountRestrictedDescription(
  status?: string,
  suspendedUntil?: string,
  reason?: string
) {
  if (status === "banned") {
    return reason
      ? `운영정책 위반으로 계정이 영구 정지되었습니다. 사유: ${reason}`
      : "운영정책 위반으로 계정이 영구 정지되었습니다.";
  }

  if (status === "suspended" && suspendedUntil) {
    return reason
      ? `${new Date(suspendedUntil).toLocaleString("ko-KR")}까지 계정 이용이 제한되었습니다. 사유: ${reason}`
      : `${new Date(suspendedUntil).toLocaleString("ko-KR")}까지 계정 이용이 제한되었습니다.`;
  }

  if (status === "suspended") {
    return reason
      ? `현재 계정 이용이 제한되었습니다. 사유: ${reason}`
      : "현재 계정 이용이 제한되었습니다.";
  }

  return "계정 상태를 확인할 수 없습니다.";
}

export function writeAccountRestrictedPayload(payload: AccountRestrictedPayload) {
  if (typeof window === "undefined") return;

  const serialized = JSON.stringify({
    status: payload.status || "",
    suspended_until: payload.suspended_until || "",
    reason: payload.reason || "",
  });

  sessionStorage.setItem(
    ACCOUNT_RESTRICTED_STORAGE_KEY,
    serialized
  );

  document.cookie = `${ACCOUNT_RESTRICTED_COOKIE_KEY}=${encodeURIComponent(
    serialized
  )}; path=/; max-age=300; samesite=lax`;
}

export function readAccountRestrictedPayload(): AccountRestrictedPayload | null {
  const raw = readAccountRestrictedPayloadSnapshot();
  return raw ? parseAccountRestrictedPayload(raw) : null;
}

export function readAccountRestrictedPayloadSnapshot(): string | null {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem(ACCOUNT_RESTRICTED_STORAGE_KEY);
  if (raw) {
    return raw;
  }

  const cookieValue = document.cookie
    .split("; ")
    .find((value) => value.startsWith(`${ACCOUNT_RESTRICTED_COOKIE_KEY}=`))
    ?.slice(`${ACCOUNT_RESTRICTED_COOKIE_KEY}=`.length);

  if (!cookieValue) {
    return null;
  }

  return cookieValue;
}

export function clearAccountRestrictedPayload() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(ACCOUNT_RESTRICTED_STORAGE_KEY);
  document.cookie = `${ACCOUNT_RESTRICTED_COOKIE_KEY}=; path=/; max-age=0; samesite=lax`;
}
