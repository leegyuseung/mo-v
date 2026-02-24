"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Eye, EyeOff } from "lucide-react";

type PasswordChangeSectionProps = {
    currentPw: string;
    setCurrentPw: (value: string) => void;
    newPw: string;
    setNewPw: (value: string) => void;
    confirmPw: string;
    setConfirmPw: (value: string) => void;
    showCurrentPw: boolean;
    setShowCurrentPw: (value: boolean) => void;
    showNewPw: boolean;
    setShowNewPw: (value: boolean) => void;
    showConfirmPw: boolean;
    setShowConfirmPw: (value: boolean) => void;
    isPwChanging: boolean;
    handleChangePassword: () => void;
};

/**
 * 비밀번호 변경 섹션 컴포넌트
 * - 현재 비밀번호, 새 비밀번호, 확인 비밀번호 입력 필드
 * - 각 필드의 비밀번호 표시/숨김 토글
 * - 비밀번호 변경 버튼 (유효성 검증은 훅에서 처리)
 */
export default function PasswordChangeSection({
    currentPw,
    setCurrentPw,
    newPw,
    setNewPw,
    confirmPw,
    setConfirmPw,
    showCurrentPw,
    setShowCurrentPw,
    showNewPw,
    setShowNewPw,
    showConfirmPw,
    setShowConfirmPw,
    isPwChanging,
    handleChangePassword,
}: PasswordChangeSectionProps) {
    return (
        <div className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">비밀번호 변경</h2>

            {/* 현재 비밀번호 */}
            <div className="space-y-1">
                <Label className="text-xs text-gray-500">현재 비밀번호</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        type={showCurrentPw ? "text" : "password"}
                        placeholder="현재 비밀번호를 입력해주세요"
                        value={currentPw}
                        onChange={(e) => setCurrentPw(e.target.value)}
                        className="h-11 pl-9 pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowCurrentPw(!showCurrentPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                        {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* 변경할 비밀번호 */}
            <div className="space-y-1">
                <Label className="text-xs text-gray-500">변경할 비밀번호</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        type={showNewPw ? "text" : "password"}
                        placeholder="변경할 비밀번호를 입력해주세요"
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        className="h-11 pl-9 pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                        {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* 변경할 비밀번호 확인 */}
            <div className="space-y-1">
                <Label className="text-xs text-gray-500">변경할 비밀번호 확인</Label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        type={showConfirmPw ? "text" : "password"}
                        placeholder="변경할 비밀번호를 다시 입력해주세요"
                        value={confirmPw}
                        onChange={(e) => setConfirmPw(e.target.value)}
                        className="h-11 pl-9 pr-10"
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                        {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                </div>
                {confirmPw && newPw !== confirmPw && (
                    <p className="text-xs text-red-500">비밀번호가 일치하지 않습니다.</p>
                )}
            </div>

            <div className="flex justify-end">
                <Button
                    type="button"
                    onClick={handleChangePassword}
                    disabled={isPwChanging || !currentPw || !newPw || !confirmPw}
                    variant="outline"
                    className="h-10 px-6 rounded-xl font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isPwChanging ? (
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                            변경 중...
                        </div>
                    ) : (
                        "비밀번호 변경"
                    )}
                </Button>
            </div>
        </div>
    );
}
