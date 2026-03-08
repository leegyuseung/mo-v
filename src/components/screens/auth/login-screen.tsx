"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useSignInWithPassword } from "@/hooks/mutations/auth/use-sign-in-with-password";
import { useSignInWithProvider } from "@/hooks/mutations/auth/use-sign-in-with-provider";
import { useLoginMethodStore } from "@/store/useLoginMethodStore";
import { resendSignUpConfirmationEmail } from "@/api/auth";
import LoginForm from "@/components/screens/auth/login-form";
import LoginSocialButtons from "@/components/screens/auth/login-social-buttons";
import {
    getAuthErrorCode,
    isEmailNotConfirmedError,
    SOCIAL_PROVIDERS,
} from "@/components/screens/auth/login-screen-utils";
import type { OAuthProvider } from "@/types/auth";
import { toast } from "sonner";
import AppFooter from "@/components/common/app-footer";

export default function LoginScreen() {
    const router = useRouter();
    const {
        lastProvider,
        saveEmail,
        savedEmail,
        setSaveEmail,
        setSavedEmail,
        rememberMe,
        setRememberMe,
    } = useLoginMethodStore();
    const [email, setEmail] = useState(() => (saveEmail ? savedEmail : ""));
    const [password, setPassword] = useState("");
    const [showEmailConfirmHelp, setShowEmailConfirmHelp] = useState(false);
    const [isResendingConfirmEmail, setIsResendingConfirmEmail] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const params = new URLSearchParams(window.location.search);
        const status = params.get("account_status");
        const suspendedUntil = params.get("suspended_until");
        const toastKey = `${status || ""}:${suspendedUntil || ""}`;

        if (!status) return;
        if (sessionStorage.getItem("login_account_status_toast") === toastKey) return;

        if (status === "banned") {
            toast.error("운영정책 위반으로 계정이 정지되었습니다.");
        } else if (status === "suspended") {
            if (suspendedUntil) {
                toast.error(
                    `${new Date(suspendedUntil).toLocaleString("ko-KR")}까지 계정 이용이 제한되었습니다.`
                );
            } else {
                toast.error("현재 계정 이용이 제한되었습니다.");
            }
        }

        sessionStorage.setItem("login_account_status_toast", toastKey);
    }, []);

    const { mutate: signIn, isPending: isSigningIn } = useSignInWithPassword({
        onError: (error) => {
            if (isEmailNotConfirmedError(error)) {
                setShowEmailConfirmHelp(true);
                toast.error("이메일 인증이 완료되지 않았습니다. 메일함에서 인증 링크를 먼저 눌러주세요.");
                return;
            }
            toast.error(error.message || "로그인에 실패했습니다.");
        },
    });
    const { mutateAsync: signInWithProvider, isPending: isSocialSigningIn } =
        useSignInWithProvider();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("이메일과 비밀번호를 입력해주세요.");
            return;
        }

        // "아이디 저장" 체크 시 이메일을 저장, 해제 시 삭제
        if (saveEmail) {
            setSavedEmail(email);
        } else {
            setSavedEmail("");
        }

        // "로그인 상태 유지" 체크 시 sessionStorage에 마커를 남기지 않음 (세션 유지)
        // 해제 시 sessionStorage에 마커를 남겨 브라우저 탭 닫힘을 감지한다
        if (!rememberMe) {
            sessionStorage.setItem("session_active", "true");
        } else {
            sessionStorage.removeItem("session_active");
        }

        signIn({ email, password });
    };

    const handleSocialLogin = async (provider: OAuthProvider) => {
        try {
            // 소셜 로그인은 항상 세션 유지 (OAuth 리디렉트 특성상)
            if (!rememberMe) {
                sessionStorage.setItem("session_active", "true");
            } else {
                sessionStorage.removeItem("session_active");
            }
            await signInWithProvider(provider);
        } catch {
            toast.error("소셜 로그인에 실패했습니다. 다시 시도해주세요.");
        }
    };

    const handleResendConfirmEmail = async () => {
        if (!email) {
            toast.error("인증 메일을 받을 이메일 주소를 먼저 입력해주세요.");
            return;
        }
        if (isResendingConfirmEmail) return;

        setIsResendingConfirmEmail(true);
        try {
            await resendSignUpConfirmationEmail(email);
            toast.success(
                "인증 메일을 다시 보냈습니다. 메일함/스팸함을 확인해주세요."
            );
        } catch (error) {
            if (getAuthErrorCode(error) === "over_email_send_rate_limit") {
                toast.error("요청이 많습니다. 1분 뒤 다시 눌러주세요.");
                return;
            }
            const message = error instanceof Error ? error.message : "인증 메일 재발송에 실패했습니다.";
            toast.error(message);
        } finally {
            setIsResendingConfirmEmail(false);
        }
    };

    return (
        <div className="flex min-h-screen w-full flex-col">
            <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-4 md:px-0">
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className="flex flex-col items-center justify-center">
                        <Link href="/">
                            <Image
                                src={"/logo.png"}
                                alt="logo"
                                height={85}
                                width={150}
                                priority
                                className="cursor-pointer"
                            />
                        </Link>
                        <span className="text-lg text-muted-foreground">
                            로그인을 하면 더 많은 서비스를 즐길 수 있습니다.
                        </span>
                    </div>
                    <LoginForm
                        email={email}
                        password={password}
                        saveEmail={saveEmail}
                        rememberMe={rememberMe}
                        lastProvider={lastProvider}
                        isSigningIn={isSigningIn}
                        isResendingConfirmEmail={isResendingConfirmEmail}
                        showEmailConfirmHelp={showEmailConfirmHelp}
                        onSubmit={handleSubmit}
                        onEmailChange={setEmail}
                        onPasswordChange={setPassword}
                        onSaveEmailChange={setSaveEmail}
                        onRememberMeChange={setRememberMe}
                        onResendConfirmEmail={handleResendConfirmEmail}
                        onFindPassword={() => router.push("/findpw")}
                        onGoSignUp={() => router.push("/signup")}
                    />
                </div>
                <LoginSocialButtons
                    isSocialSigningIn={isSocialSigningIn}
                    lastProvider={lastProvider === "google" || lastProvider === "kakao" ? lastProvider : null}
                    onSocialLogin={handleSocialLogin}
                    providers={SOCIAL_PROVIDERS}
                />
            </div>
            <AppFooter />
        </div>
    );
}
