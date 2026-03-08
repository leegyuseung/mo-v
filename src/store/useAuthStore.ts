import { create } from "zustand";
import { createClient } from "@/utils/supabase/client";
import type { Profile, HeartPoints } from "@/types/profile";
import type { AuthState, AuthActions } from "@/types/auth";
import { ensureSignUpBonusClaimedOncePerSession } from "@/lib/auth/ensure-signup-bonus";
import { useLoginMethodStore } from "@/store/useLoginMethodStore";
import type { LoginProvider } from "@/store/useLoginMethodStore";
import { getAccountRestrictionMessage } from "@/utils/account-status";
import { writeAccountRestrictedPayload } from "@/lib/account-restricted";

export type { Profile, HeartPoints };

const supabase = createClient();
export const useAuthStore = create<AuthState & AuthActions>((set) => ({
    // State
    user: null,
    profile: null,
    heartPoints: null,
    isLoading: true,
    isInitialized: false,

    // Actions
    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile }),
    setHeartPoints: (heartPoints) => set({ heartPoints }),
    setSession: (user, profile, heartPoints) =>
        set({ user, profile, heartPoints }),
    clearSession: () =>
        set({ user: null, profile: null, heartPoints: null }),

    initializeSession: async () => {
        set({ isLoading: true });

        try {
            // Supabase에서 현재 세션 가져오기
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (session?.user) {
                const pathname =
                    typeof window !== "undefined" ? window.location.pathname : "";
                const isAgreementFlowPath =
                    pathname.startsWith("/auth/agreements") ||
                    pathname.startsWith("/auth/callback");

                const { data: agreement, error: agreementError } = await supabase
                    .from("user_agreements")
                    .select("terms_accepted,privacy_accepted,third_party_accepted")
                    .eq("user_id", session.user.id)
                    .maybeSingle();

                const isRequiredAgreementAccepted = Boolean(
                    agreement?.terms_accepted && agreement?.privacy_accepted && agreement?.third_party_accepted
                );

                // 약관 미동의 상태에서는 약관 동의 화면 외 경로에서 로그인 상태를 유지하지 않는다.
                if (!isRequiredAgreementAccepted && !isAgreementFlowPath) {
                    if (!agreementError || agreementError.code !== "42P01") {
                        await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
                        set({
                            user: null,
                            profile: null,
                            heartPoints: null,
                            isLoading: false,
                            isInitialized: true,
                        });
                        return;
                    }
                }

                // "로그인 상태 유지" 미체크 시에도 탭 간 세션은 공유되어야 한다.
                // sessionStorage는 탭 단위이므로, 마커 부재를 근거로 전역 signOut 하면
                // 다른 탭 세션까지 끊겨버리므로 현재 탭에 마커만 보정한다.
                const { rememberMe } = useLoginMethodStore.getState();
                if (!rememberMe && !sessionStorage.getItem("session_active")) {
                    sessionStorage.setItem("session_active", "true");
                }

                // 필수 약관 동의 완료 상태에서 회원가입 보너스를 1회 지급 시도한다.
                if (isRequiredAgreementAccepted) {
                    await ensureSignUpBonusClaimedOncePerSession(session.user.id).catch(() => undefined);
                }

                // 프로필 조회
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", session.user.id)
                    .single();

                const restrictionMessage = getAccountRestrictionMessage(profile);
                if (restrictionMessage) {
                    await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
                    if (typeof window !== "undefined") {
                        writeAccountRestrictedPayload({
                            status: profile?.account_status || "suspended",
                            suspended_until: profile?.suspended_until || "",
                            reason: profile?.suspension_reason || "",
                        });
                    }
                    set({
                        user: null,
                        profile: null,
                        heartPoints: null,
                    });
                    return;
                }

                const authUser = {
                    email: session.user.email || null,
                    id: session.user.id,
                    provider: (session.user.app_metadata?.provider as string | undefined) || null,
                };

                // 하트 포인트 조회
                const { data: heartPoints } = await supabase
                    .from("heart_points")
                    .select("*")
                    .eq("id", session.user.id)
                    .single();

                set({
                    user: authUser,
                    profile: profile || null,
                    heartPoints: heartPoints || null,
                });

                // 세션의 provider 정보를 읽어 마지막 로그인 방식을 저장한다
                const provider = authUser.provider || undefined;
                const validProviders: LoginProvider[] = ["email", "google", "kakao"];
                if (provider && validProviders.includes(provider as LoginProvider)) {
                    useLoginMethodStore.getState().setLastProvider(provider as LoginProvider);
                }
            }
        } catch (error) {
            console.error("Failed to initialize session:", error);
        } finally {
            set({ isLoading: false, isInitialized: true });
        }
    },
}));
