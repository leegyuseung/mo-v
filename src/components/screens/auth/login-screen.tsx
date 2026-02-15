"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSignInWithPassword } from "@/hooks/mutations/auth/use-sign-in-with-password";
import { signInWithProvider } from "@/api/auth";
import { toast } from "sonner";
import AppFooter from "@/components/common/app-footer";

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

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
        signIn({ email, password });
    };

    const handleSocialLogin = async (provider: "google" | "kakao") => {
        try {
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
                            로그인 후 더 많은 서비스를 즐겨보세요.
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
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-12.5 cursor-pointer"
                        >
                            {isPending ? "로그인 중..." : "로그인"}
                        </Button>
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
                    <button
                        onClick={() => toast.info("네이버 로그인은 준비 중입니다.")}
                        className="cursor-pointer"
                    >
                        <Image
                            src="/naver_login_icon.png"
                            alt="네이버 로그인"
                            height={56}
                            width={56}
                            className="w-10 h-10 md:w-14 md:h-14"
                            priority
                        />
                    </button>
                    <button
                        onClick={() => handleSocialLogin("kakao")}
                        className="cursor-pointer"
                    >
                        <Image
                            src="/kakao_login_icon.png"
                            alt="카카오 로그인"
                            height={56}
                            width={56}
                            className="w-10 h-10 md:w-14 md:h-14"
                            priority
                        />
                    </button>
                    <button
                        onClick={() => handleSocialLogin("google")}
                        className="cursor-pointer"
                    >
                        <Image
                            src="/google_login_icon.svg"
                            alt="구글 로그인"
                            height={56}
                            width={56}
                            className="w-10 h-10 md:w-14 md:h-14"
                            priority
                        />
                    </button>
                </div>
            </div>
            <AppFooter />
        </div>
    );
}
