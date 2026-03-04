import type {
  UpdateUserProfilePrivacyPayload,
  UserProfilePrivacyStatusResponse,
} from "@/types/user-profile-privacy";

export async function fetchMyProfilePrivacy() {
  const response = await fetch("/api/profile/privacy", {
    method: "GET",
    cache: "no-store",
  });

  const body = (await response.json().catch(() => null)) as
    | UserProfilePrivacyStatusResponse
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new Error((body as { message?: string } | null)?.message || "공개 범위 조회에 실패했습니다.");
  }

  return body as UserProfilePrivacyStatusResponse;
}

export async function updateMyProfilePrivacy(payload: UpdateUserProfilePrivacyPayload) {
  const response = await fetch("/api/profile/privacy", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const body = (await response.json().catch(() => null)) as
    | UserProfilePrivacyStatusResponse
    | { message?: string }
    | null;

  if (!response.ok) {
    throw new Error((body as { message?: string } | null)?.message || "공개 범위 변경에 실패했습니다.");
  }

  return body as UserProfilePrivacyStatusResponse;
}
