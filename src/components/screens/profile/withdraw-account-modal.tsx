"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { WITHDRAW_CONFIRM_PHRASE } from "@/hooks/profile/use-withdraw-account";

type WithdrawAccountModalProps = {
    isEmailProvider: boolean;
    withdrawPassword: string;
    setWithdrawPassword: (value: string) => void;
    withdrawPasswordConfirm: string;
    setWithdrawPasswordConfirm: (value: string) => void;
    withdrawConfirmText: string;
    setWithdrawConfirmText: (value: string) => void;
    isWithdrawing: boolean;
    handleWithdrawAccount: () => void;
    closeWithdrawConfirmModal: () => void;
};

/**
 * 회원탈퇴 확인 모달 컴포넌트
 * - 이메일 가입 사용자: 비밀번호 + 비밀번호 확인 + 확인 문구 입력
 * - 소셜 로그인 사용자: 확인 문구만 입력
 * - 탈퇴 처리는 부모 훅에서 전달받은 핸들러로 실행
 */
export default function WithdrawAccountModal({
    isEmailProvider,
    withdrawPassword,
    setWithdrawPassword,
    withdrawPasswordConfirm,
    setWithdrawPasswordConfirm,
    withdrawConfirmText,
    setWithdrawConfirmText,
    isWithdrawing,
    handleWithdrawAccount,
    closeWithdrawConfirmModal,
}: WithdrawAccountModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-5 shadow-xl">
                <h3 className="text-base font-semibold text-gray-900">회원탈퇴 확인</h3>
                <p className="mt-2 text-sm text-gray-500">
                    비밀번호를 한 번 더 입력하고 확인 문구를 입력해야 탈퇴가 진행됩니다.
                </p>

                <div className="mt-4 space-y-3">
                    {isEmailProvider ? (
                        <>
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-500">비밀번호</Label>
                                <Input
                                    type="password"
                                    value={withdrawPassword}
                                    onChange={(e) => setWithdrawPassword(e.target.value)}
                                    placeholder="비밀번호 입력"
                                    className="h-10"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label className="text-xs text-gray-500">비밀번호 확인</Label>
                                <Input
                                    type="password"
                                    value={withdrawPasswordConfirm}
                                    onChange={(e) => setWithdrawPasswordConfirm(e.target.value)}
                                    placeholder="비밀번호 확인 입력"
                                    className="h-10"
                                />
                            </div>
                        </>
                    ) : (
                        <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                            소셜 로그인 계정은 비밀번호 확인 없이 탈퇴가 진행됩니다.
                        </p>
                    )}
                    <div className="space-y-1">
                        <Label className="text-xs text-gray-500">
                            확인 문구 입력: {WITHDRAW_CONFIRM_PHRASE}
                        </Label>
                        <Input
                            value={withdrawConfirmText}
                            onChange={(e) => setWithdrawConfirmText(e.target.value)}
                            placeholder={WITHDRAW_CONFIRM_PHRASE}
                            className="h-10"
                        />
                    </div>
                </div>

                <div className="mt-5 flex justify-end gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={closeWithdrawConfirmModal}
                        disabled={isWithdrawing}
                        className="cursor-pointer"
                    >
                        취소
                    </Button>
                    <Button
                        type="button"
                        onClick={handleWithdrawAccount}
                        disabled={
                            isWithdrawing ||
                            (isEmailProvider && (!withdrawPassword || !withdrawPasswordConfirm)) ||
                            withdrawConfirmText.trim() !== WITHDRAW_CONFIRM_PHRASE
                        }
                        className="cursor-pointer bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                    >
                        {isWithdrawing ? "탈퇴 처리중..." : "확인"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
