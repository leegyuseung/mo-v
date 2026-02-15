import { create } from "zustand";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/client";
import type { Profile, HeartPoints } from "@/types/profile";
import type { AuthState, AuthActions } from "@/types/auth";

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
            }
        } catch (error) {
            console.error("Failed to initialize session:", error);
        } finally {
            set({ isLoading: false, isInitialized: true });
        }
    },
}));
