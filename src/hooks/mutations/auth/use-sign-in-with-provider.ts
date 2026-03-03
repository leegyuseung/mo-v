import { useMutation } from "@tanstack/react-query";
import { signInWithProvider } from "@/api/auth";
import type { OAuthProvider } from "@/types/auth";

/** 소셜 로그인(OAuth) 진입 mutation 훅 */
export function useSignInWithProvider() {
  return useMutation({
    mutationFn: (provider: OAuthProvider) => signInWithProvider(provider),
  });
}
