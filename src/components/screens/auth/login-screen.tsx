"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSignInWithPassword } from "@/hooks/mutations/auth/use-sign-in-with-password";
import { signInWithProvider } from "@/api/auth";
import { useLoginMethodStore } from "@/store/useLoginMethodStore";
import type { LoginProvider } from "@/store/useLoginMethodStore";
import { toast } from "sonner";
import AppFooter from "@/components/common/app-footer";

/** 소셜 로그인 버튼 정보 */
const SOCIAL_PROVIDERS: {
    provider: LoginProvider | null;
    src: string;
    alt: string;
    disabled?: boolean;
}[] = [
        { provider: null, src: "/naver_login_icon.png", alt: "네이버 로그인", disabled: true },
        { provider: "kakao", src: "/kakao_login_icon.png", alt: "카카오 로그인" },
        { provider: "google", src: "/google_login_icon.svg", alt: "구글 로그인" },
    ];

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const {
        lastProvider,
        saveEmail,
        savedEmail,
        setSaveEmail,
        setSavedEmail,
        rememberMe,
        setRememberMe,
    } = useLoginMethodStore();

    // "아이디 저장"이 켜져 있으면 저장된 이메일로 초기값을 설정한다
    useEffect(() => {
        if (saveEmail && savedEmail) {
            setEmail(savedEmail);
        }
    }, [saveEmail, savedEmail]);

    const { mutate: signIn, isPending } = useSignInWithPassword({
        onError: (error) => {
            toast.error("로그인 실패: " + error.message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
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

    const handleSocialLogin = async (provider: "google" | "kakao") => {
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

    return (
        <div className="flex flex-col items-center w-full">
            <div className="flex flex-col justify-center flex-1 w-full max-w-md px-4 md:px-0 gap-8 mb-12">
                <div className="flex flex-col items-center justify-center gap-4">
                    <div className="flex flex-col items-center justify-center">
                        <Image
                            src={"/logo.png"}
                            alt="logo"
                            height={85}
                            width={150}
                            priority
                        />
                        <span className="text-lg text-muted-foreground">
                            로그인을 하면 더 많은 서비스를 즐길 수 있습니다.
                        </span>
                    </div>
                    <form onSubmit={handleSubmit} className="w-full flex flex-col items-center justify-center gap-6">
                        <div className="w-full flex flex-col gap-2">
                            <Input
                                type="email"
                                placeholder="이메일"
                                className="h-12.5"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <Input
                                type="password"
                                placeholder="비밀번호"
                                className="h-12.5"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="w-full flex items-center justify-center gap-6 text-sm text-muted-foreground">
                            <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                <Checkbox
                                    checked={rememberMe}
                                    onCheckedChange={(checked) => setRememberMe(!!checked)}
                                />
                                로그인 상태 유지
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer select-none">
                                <Checkbox
                                    checked={saveEmail}
                                    onCheckedChange={(checked) => setSaveEmail(!!checked)}
                                />
                                아이디 저장
                            </label>
                        </div>
                        <div className="w-full relative">
                            <Button
                                type="submit"
                                disabled={isPending}
                                className="w-full h-12.5 cursor-pointer"
                            >
                                {isPending ? "로그인 중..." : "로그인"}
                            </Button>
                            {lastProvider === "email" && (
                                <span className="absolute -top-2 -right-2 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">
                                    최근 사용
                                </span>
                            )}
                        </div>
                    </form>
                    <div className="flex text-sm text-muted-foreground gap-4">
                        <button
                            onClick={() => router.push("/findpw")}
                            className="cursor-pointer hover:bg-sidebar-accent rounded-sm"
                        >
                            비밀번호 찾기
                        </button>
                        <div>|</div>
                        <button
                            onClick={() => router.push("/signup")}
                            className="cursor-pointer hover:bg-sidebar-accent rounded-sm"
                        >
                            회원 가입
                        </button>
                    </div>
                </div>
                <div className="flex justify-center gap-3 md:gap-4">
                    {SOCIAL_PROVIDERS.map(({ provider, src, alt, disabled }) => (
                        <div key={alt} className="relative">
                            <button
                                onClick={() =>
                                    disabled
                                        ? toast.info("네이버 로그인은 준비 중입니다.")
                                        : handleSocialLogin(provider as "google" | "kakao")
                                }
                                className="cursor-pointer"
                            >
                                <Image
                                    src={src}
                                    alt={alt}
                                    height={56}
                                    width={56}
                                    className="w-10 h-10 md:w-14 md:h-14"
                                    priority
                                />
                            </button>
                            {provider && lastProvider === provider && (
                                <span className="absolute -top-2 -right-2 text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap">
                                    최근 사용
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <AppFooter />
        </div>
    );
}
