import type { LoginEmailConfirmHelpProps } from "@/types/login-screen";

export default function LoginEmailConfirmHelp({
  isResendingConfirmEmail,
  onResend,
}: LoginEmailConfirmHelpProps) {
  return (
    <div className="w-full rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
      <p>이메일 인증 후 로그인이 가능합니다.</p>
      <p className="mt-1">메일을 삭제했으면 같은 이메일로 인증 메일 재발송을 눌러주세요.</p>
      <p className="mt-1">가입 이메일에 접근할 수 없으면 새로운 이메일로 다시 회원가입해야 합니다.</p>
      <button
        type="button"
        onClick={onResend}
        disabled={isResendingConfirmEmail}
        className="mt-2 cursor-pointer rounded-md border border-amber-300 bg-white px-2.5 py-1 text-[11px] font-medium text-amber-900 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isResendingConfirmEmail ? "재발송 중..." : "인증 메일 재발송"}
      </button>
    </div>
  );
}
