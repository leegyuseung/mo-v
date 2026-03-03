import type { SocialProviderOption } from "@/types/login-screen";

export const SOCIAL_PROVIDERS: SocialProviderOption[] = [
  { provider: "kakao", src: "/kakao_login_icon.png", alt: "카카오 로그인" },
  { provider: "google", src: "/google_login_icon.svg", alt: "구글 로그인" },
];

export function isEmailNotConfirmedError(error: Error) {
  const message = (error.message || "").toLowerCase();
  return message.includes("email not confirmed");
}

export function getAuthErrorCode(error: unknown) {
  if (error && typeof error === "object" && "code" in error) {
    return String((error as { code?: unknown }).code || "");
  }
  return "";
}
