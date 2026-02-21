"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { resetPassword } from "@/api/auth";
import { toast } from "sonner";
import { Mail } from "lucide-react";

export default function FindPasswordScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [isPending, setIsPending] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("이메일을 입력해주세요.");
            return;
        }

        setIsPending(true);
        try {
            await resetPassword(email);
            setIsSent(true);
            toast.success("비밀번호 재설정 메일이 발송되었습니다.");
        } catch {
            toast.error("메일 발송에 실패했습니다. 이메일을 확인해주세요.");
        } finally {
            setIsPending(false);
        }
    };

    return (
        <div className="flex flex-col justify-center w-full max-w-md px-4 md:px-0 gap-6">
            {!isSent && (
                <div className="flex flex-col items-center gap-2">
                    <Link href="/">
                        <Image
                            src="/logo.png"
                            alt="logo"
                            height={85}
                            width={150}
                            priority
                            className="cursor-pointer"
                        />
                    </Link>
                    <h1 className="text-lg font-bold text-gray-900">비밀번호 찾기</h1>
                    <p className="text-sm text-muted-foreground text-center">
                        가입한 이메일 주소를 입력하시면
                        <br />
                        비밀번호 재설정 링크를 보내드립니다.
                    </p>
                </div>
            )}

            {isSent ? (
                /* 발송 완료 상태 */
                <div className="flex flex-col items-center gap-4 py-6">
                    <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center">
                        <Mail className="w-7 h-7 text-green-500" />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-gray-900 mb-1">메일이 발송되었습니다</p>
                        <p className="text-sm text-gray-500">
                            <span className="font-medium text-gray-700">{email}</span>
                            으로 비밀번호 재설정 링크를 보냈습니다.
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                            메일이 오지 않으면 스팸함을 확인해주세요.
                        </p>
                    </div>
                    <div className="flex gap-2 w-full">
                        <Button
                            variant="outline"
                            onClick={() => setIsSent(false)}
                            className="flex-1 h-11 cursor-pointer"
                        >
                            다시 보내기
                        </Button>
                        <Button
                            onClick={() => router.push("/login")}
                            className="flex-1 h-11 cursor-pointer"
                        >
                            로그인으로
                        </Button>
                    </div>
                </div>
            ) : (
                /* 이메일 입력 폼 */
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <Input
                        type="email"
                        placeholder="가입한 이메일 주소를 입력해주세요"
                        className="h-12.5"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full h-12.5 cursor-pointer"
                    >
                        {isPending ? "메일 발송 중..." : "비밀번호 재설정 메일 보내기"}
                    </Button>
                </form>
            )}
        </div>
    );
}
