import { signInWithPassword, signOut } from "@/api/auth";
import { fetchUserProfile } from "@/api/profile";
import { fetchHeartPoints } from "@/api/heart";
import type { MutationCallback } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { getAccountRestrictionMessage } from "@/utils/account-status";
import { writeAccountRestrictedPayload } from "@/lib/account-restricted";

export function useSignInWithPassword(callbacks?: MutationCallback) {
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
                    const restrictionMessage = getAccountRestrictionMessage(profile);

                    if (restrictionMessage) {
                        await signOut().catch(() => undefined);
                        setSession(null, null, null);
                        writeAccountRestrictedPayload({
                          status: profile?.account_status || "suspended",
                          suspended_until: profile?.suspended_until || "",
                          reason: profile?.suspension_reason || "",
                        });
                        callbacks?.onError?.(new Error(restrictionMessage));
                        router.replace("/account-restricted");
                        return;
                    }

                    setSession(
                      {
                        email: user.email || null,
                        id: user.id,
                        provider: (user.app_metadata?.provider as string | undefined) || null,
                      },
                      profile,
                      heartPoints
                    );
                } catch (error) {
                    console.error("Failed to fetch user data:", error);
                    setSession(
                      {
                        email: user.email || null,
                        id: user.id,
                        provider: (user.app_metadata?.provider as string | undefined) || null,
                      },
                      null,
                      null
                    );
                }
            }
            router.replace("/");
        },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
