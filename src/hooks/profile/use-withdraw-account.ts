"use client";

import { useState } from "react";
import { deleteMyAccount } from "@/api/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

/** 회원탈퇴 확인 문구 상수 */
export const WITHDRAW_CONFIRM_PHRASE = "탈퇴하겠습니다";

/**
 * 회원탈퇴 관련 상태와 로직을 관리하는 커스텀 훅
 * - 탈퇴 안내 알림 및 확인 모달 상태
 * - 비밀번호 확인 (이메일 가입 사용자) 및 확인 문구 입력 상태
 * - 탈퇴 API 호출 및 세션 정리
 */
export function useWithdrawAccount() {
    const { user, profile, clearSession } = useAuthStore();

    // 모달 상태
    const [isWithdrawAlertOpen, setIsWithdrawAlertOpen] = useState(false);
    const [isWithdrawConfirmOpen, setIsWithdrawConfirmOpen] = useState(false);

    // 탈퇴 폼 상태
    const [withdrawPassword, setWithdrawPassword] = useState("");
    const [withdrawPasswordConfirm, setWithdrawPasswordConfirm] = useState("");
    const [withdrawConfirmText, setWithdrawConfirmText] = useState("");

    // 탈퇴 진행 상태
    const [isWithdrawing, setIsWithdrawing] = useState(false);

    // 이메일 가입 사용자 여부
    const isEmailProvider = user?.app_metadata?.provider === "email";

    /** 탈퇴 폼 초기화 */
    const resetWithdrawForm = () => {
        setWithdrawPassword("");
        setWithdrawPasswordConfirm("");
        setWithdrawConfirmText("");
    };

    /** 탈퇴 확인 모달 닫기 및 폼 초기화 */
    const closeWithdrawConfirmModal = () => {
        setIsWithdrawConfirmOpen(false);
        resetWithdrawForm();
    };

    /** 회원탈퇴 처리 - 유효성 검증 후 API 호출 및 세션 정리 */
    const handleWithdrawAccount = async () => {
        if (!user) {
            toast.error("사용자 정보를 확인할 수 없습니다.");
            return;
        }
        if (isEmailProvider) {
            if (!profile?.email) {
                toast.error("이메일 정보를 확인할 수 없습니다.");
                return;
            }
            if (!withdrawPassword || !withdrawPasswordConfirm) {
                toast.error("비밀번호를 입력해주세요.");
                return;
            }
            if (withdrawPassword !== withdrawPasswordConfirm) {
                toast.error("비밀번호 확인이 일치하지 않습니다.");
                return;
            }
        }
        if (withdrawConfirmText.trim() !== WITHDRAW_CONFIRM_PHRASE) {
            toast.error(`확인 문구를 정확히 입력해주세요: ${WITHDRAW_CONFIRM_PHRASE}`);
            return;
        }

        setIsWithdrawing(true);
        try {
            await deleteMyAccount({
                provider: user.app_metadata?.provider,
                email: profile?.email || undefined,
                password: isEmailProvider ? withdrawPassword : undefined,
            });
            await clearSession();
            toast.success("회원탈퇴가 완료되었습니다.");
            window.location.replace("/login");
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "회원탈퇴 처리에 실패했습니다.";
            toast.error(message);
        } finally {
            setIsWithdrawing(false);
        }
    };

    return {
        // 모달 상태
        isWithdrawAlertOpen,
        setIsWithdrawAlertOpen,
        isWithdrawConfirmOpen,
        setIsWithdrawConfirmOpen,

        // 탈퇴 폼 상태
        withdrawPassword,
        setWithdrawPassword,
        withdrawPasswordConfirm,
        setWithdrawPasswordConfirm,
        withdrawConfirmText,
        setWithdrawConfirmText,

        // 탈퇴 처리
        isWithdrawing,
        isEmailProvider,
        handleWithdrawAccount,
        closeWithdrawConfirmModal,
    };
}
