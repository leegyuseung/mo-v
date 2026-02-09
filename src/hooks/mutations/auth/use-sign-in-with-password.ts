import {
  signInWithPassword,
  fetchUserProfile,
  fetchHeartPoints,
} from "@/api/auth";
import { useMutationCallback } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export function useSignInWithPassword(callbacks?: useMutationCallback) {
  const router = useRouter();
  const { setSession } = useAuthStore();

  return useMutation({
    mutationFn: signInWithPassword,
    onSuccess: async (data) => {
      // 로그인 성공 시 프로필과 포인트 조회 후 store에 저장
      const user = data.user;
      if (user) {
        try {
          const [profile, heartPoints] = await Promise.all([
            fetchUserProfile(user.id),
            fetchHeartPoints(user.id),
          ]);
          setSession(user, profile, heartPoints);
        } catch (error) {
          console.error("Failed to fetch user data:", error);
          setSession(user, null, null);
        }
      }
      router.replace("/");
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
