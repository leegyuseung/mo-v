"use client";

import { useState } from "react";
import { changePassword } from "@/api/auth";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

/**
 * 비밀번호 변경 관련 상태와 로직을 관리하는 커스텀 훅
 * - 현재 비밀번호, 새 비밀번호, 확인 비밀번호 입력 상태
 * - 비밀번호 표시/숨김 토글 상태
 * - 비밀번호 변경 API 호출 및 유효성 검증
 */
export function usePasswordChange() {
    const { user, profile } = useAuthStore();

    // 비밀번호 입력 상태
    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");

    // 비밀번호 표시/숨김 상태
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);

    // 변경 진행 상태
    const [isPwChanging, setIsPwChanging] = useState(false);

    /** 비밀번호 변경 처리 - 유효성 검증 후 API 호출 */
    const handleChangePassword = async () => {
        if (!currentPw) {
            toast.error("현재 비밀번호를 입력해주세요.");
            return;
        }
        if (!newPw) {
            toast.error("변경할 비밀번호를 입력해주세요.");
            return;
        }
        if (newPw !== confirmPw) {
            toast.error("변경할 비밀번호가 일치하지 않습니다.");
            return;
        }
        if (newPw.length < 6) {
            toast.error("비밀번호는 6자 이상이어야 합니다.");
            return;
        }

        setIsPwChanging(true);
        try {
            await changePassword(
                user?.email || profile?.email || "",
                currentPw,
                newPw
            );
            toast.success("비밀번호가 성공적으로 변경되었습니다.");
            setCurrentPw("");
            setNewPw("");
            setConfirmPw("");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "비밀번호 변경에 실패했습니다.";
            toast.error(message);
        } finally {
            setIsPwChanging(false);
        }
    };

    return {
        // 비밀번호 입력 상태
        currentPw,
        setCurrentPw,
        newPw,
        setNewPw,
        confirmPw,
        setConfirmPw,

        // 비밀번호 표시/숨김 상태
        showCurrentPw,
        setShowCurrentPw,
        showNewPw,
        setShowNewPw,
        showConfirmPw,
        setShowConfirmPw,

        // 변경 처리
        isPwChanging,
        handleChangePassword,
    };
}
