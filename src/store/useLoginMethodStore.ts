import { create } from "zustand";
import { persist } from "zustand/middleware";

/** 로그인 공급자 종류 */
export type LoginProvider = "email" | "google" | "kakao";

interface LoginMethodState {
    /** 가장 최근에 사용한 로그인 방식 */
    lastProvider: LoginProvider | null;
    /** 로그인 성공 시 호출하여 방식을 저장한다 */
    setLastProvider: (provider: LoginProvider) => void;

    /** "아이디 저장" 체크 여부 */
    saveEmail: boolean;
    /** 저장된 이메일 주소 */
    savedEmail: string;
    /** "아이디 저장" 체크 상태를 변경한다 */
    setSaveEmail: (value: boolean) => void;
    /** 이메일 주소를 저장한다 */
    setSavedEmail: (email: string) => void;

    /** "로그인 상태 유지" 체크 여부 */
    rememberMe: boolean;
    /** "로그인 상태 유지" 체크 상태를 변경한다 */
    setRememberMe: (value: boolean) => void;
}

/**
 * 로그인 환경설정을 localStorage에 유지하는 스토어.
 * - lastProvider: 마지막 로그인 방식 (뱃지 표시용)
 * - saveEmail / savedEmail: 아이디 저장
 * - rememberMe: 로그인 상태 유지
 */
export const useLoginMethodStore = create<LoginMethodState>()(
    persist(
        (set) => ({
            lastProvider: null,
            setLastProvider: (provider) => set({ lastProvider: provider }),

            saveEmail: false,
            savedEmail: "",
            setSaveEmail: (value) => set({ saveEmail: value }),
            setSavedEmail: (email) => set({ savedEmail: email }),

            rememberMe: false,
            setRememberMe: (value) => set({ rememberMe: value }),
        }),
        { name: "login-preferences" }
    )
);
