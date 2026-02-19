import { create } from "zustand";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import type { Profile, HeartPoints } from "@/types/profile";
import type { AuthState, AuthActions } from "@/types/auth";
import { useLoginMethodStore } from "@/store/useLoginMethodStore";
import type { LoginProvider } from "@/store/useLoginMethodStore";

export type { Profile, HeartPoints };

const supabase = createClient();

export const useAuthStore = create<AuthState & AuthActions>((set, get) => ({
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
        // 이미 초기화되었으면 스킵
        if (get().isInitialized) {
            return;
        }

        set({ isLoading: true });

        try {
            // Supabase에서 현재 세션 가져오기
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (session?.user) {
                // "로그인 상태 유지" 미체크 시: sessionStorage 마커가 없으면 브라우저가
                // 닫혔다 열린 것이므로 세션을 만료시킨다.
                const { rememberMe } = useLoginMethodStore.getState();
                if (!rememberMe && !sessionStorage.getItem("session_active")) {
                    await supabase.auth.signOut();
                    set({ isLoading: false, isInitialized: true });
                    return;
                }
                // 프로필 조회
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("*")
                    .eq("id", session.user.id)
                    .single();

                // 하트 포인트 조회
                const { data: heartPoints } = await supabase
                    .from("heart_points")
                    .select("*")
                    .eq("id", session.user.id)
                    .single();

                set({
                    user: session.user,
                    profile: profile || null,
                    heartPoints: heartPoints || null,
                });

                // 세션의 provider 정보를 읽어 마지막 로그인 방식을 저장한다
                const provider = session.user.app_metadata?.provider as string | undefined;
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
