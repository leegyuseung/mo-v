import { useMutation } from "@tanstack/react-query";
import { signInWithProvider } from "@/api/auth";
import type { LoginProvider } from "@/store/useLoginMethodStore";

/** 소셜 로그인(OAuth) 진입 mutation 훅 */
export function useSignInWithProvider() {
  return useMutation({
    mutationFn: (provider: Extract<LoginProvider, "google" | "kakao">) =>
      signInWithProvider(provider),
  });
}
