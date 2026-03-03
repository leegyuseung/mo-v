import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import LoginEmailConfirmHelp from "@/components/screens/auth/login-email-confirm-help";
import type { LoginFormProps } from "@/types/login-screen";

export default function LoginForm({
  email,
  password,
  saveEmail,
  rememberMe,
  lastProvider,
  isSigningIn,
  isResendingConfirmEmail,
  showEmailConfirmHelp,
  onSubmit,
  onEmailChange,
  onPasswordChange,
  onSaveEmailChange,
  onRememberMeChange,
  onResendConfirmEmail,
  onFindPassword,
  onGoSignUp,
}: LoginFormProps) {
  return (
    <>
      <form onSubmit={onSubmit} className="w-full flex flex-col items-center justify-center gap-6">
        <div className="w-full flex flex-col gap-2">
          <Input
            type="email"
            placeholder="이메일"
            className="h-12.5"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
          />
          <Input
            type="password"
            placeholder="비밀번호"
            className="h-12.5"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
          />
        </div>
        <div className="w-full flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <label className="flex cursor-pointer select-none items-center gap-1.5">
            <Checkbox checked={rememberMe} onCheckedChange={(checked) => onRememberMeChange(!!checked)} />
            로그인 상태 유지
          </label>
          <label className="flex cursor-pointer select-none items-center gap-1.5">
            <Checkbox checked={saveEmail} onCheckedChange={(checked) => onSaveEmailChange(!!checked)} />
            아이디 저장
          </label>
        </div>
        <div className="w-full relative">
          <Button type="submit" disabled={isSigningIn} className="w-full h-12.5 cursor-pointer">
            {isSigningIn ? "로그인 중..." : "로그인"}
          </Button>
          {lastProvider === "email" ? (
            <span className="absolute -top-2 -right-2 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
              최근 사용
            </span>
          ) : null}
        </div>
        {showEmailConfirmHelp ? (
          <LoginEmailConfirmHelp
            isResendingConfirmEmail={isResendingConfirmEmail}
            onResend={onResendConfirmEmail}
          />
        ) : null}
      </form>
      <div className="flex text-sm text-muted-foreground gap-4">
        <button type="button" onClick={onFindPassword} className="cursor-pointer rounded-sm hover:bg-sidebar-accent">
          비밀번호 찾기
        </button>
        <div>|</div>
        <button type="button" onClick={onGoSignUp} className="cursor-pointer rounded-sm hover:bg-sidebar-accent">
          회원 가입
        </button>
      </div>
    </>
  );
}
