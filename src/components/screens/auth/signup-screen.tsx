"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpFormValues, signUpSchema } from "@/utils/schema";
import { useSignUp } from "@/hooks/mutations/auth/use-sign-up";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronRight } from "lucide-react";
import { TermsModal } from "./terms-modal";

import termsMd from "@/app/(auth)/signup/agreements/terms.md";
import privacyMd from "@/app/(auth)/signup/agreements/privacy.md";
import thirdPartyMd from "@/app/(auth)/signup/agreements/third_party.md";
import marketingMd from "@/app/(auth)/signup/agreements/marketing.md";

const AGREEMENTS = [
    { id: "terms", title: "서비스 이용약관 동의", required: true, content: termsMd },
    { id: "privacy", title: "개인정보 수집 및 이용 동의", required: true, content: privacyMd },
    { id: "thirdParty", title: "개인정보 처리 위탁 동의", required: false, content: thirdPartyMd },
    { id: "marketing", title: "마케팅 정보 수신 동의", required: false, content: marketingMd },
] as const;

type AgreementId = (typeof AGREEMENTS)[number]["id"];

export default function SignupScreen() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowCofirmPassword] = useState(false);
    const router = useRouter();

    const [agreements, setAgreements] = useState<Record<AgreementId, boolean>>({
        terms: false,
        privacy: false,
        thirdParty: false,
        marketing: false,
    });
    const [modalContent, setModalContent] = useState<{ title: string; content: string } | null>(null);

    const isAllChecked = Object.values(agreements).every(Boolean);
    const isRequiredChecked = AGREEMENTS.filter(a => a.required).every(a => agreements[a.id]);

    const handleAllCheck = (checked: boolean) => {
        const nextState = Object.keys(agreements).reduce(
            (acc, key) => ({ ...acc, [key]: checked }),
            {} as Record<AgreementId, boolean>
        );
        setAgreements(nextState);
    };

    const handleSingleCheck = (id: AgreementId, checked: boolean) => {
        setAgreements(prev => ({ ...prev, [id]: checked }));
    };

    const { mutate: signupMutate, isPending: signupIsPending } = useSignUp({
        onSuccess: () => {
            toast.success("회원가입 메일이 발송되었습니다. 메일함을 확인해주세요!", {
                position: "top-center",
            });

            router.replace("/login");
        },
        onError: (error) => {
            const errorCode = (error as any).code;
            let errorMessage = "회원가입 중 오류가 발생했습니다.";

            switch (errorCode) {
                case "user_already_exists":
                    errorMessage = "이미 가입된 이메일입니다.";
                    break;
                case "email_address_invalid":
                    errorMessage = "유효하지 않은 이메일 형식입니다.";
                    break;
                case "signup_disabled":
                    errorMessage = "현재 회원가입이 비활성화되어 있습니다.";
                    break;
                case "over_email_send_rate_limit":
                    errorMessage =
                        "단시간에 너무 많은 요청이 있었습니다. 잠시 후 다시 시도해주세요.";
                    break;
                default:
                    errorMessage = "회원가입 중 오류가 발생했습니다.";
            }
            toast.error(errorMessage, {
                position: "top-center",
            });
        },
    });

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignUpFormValues>({
        resolver: zodResolver(signUpSchema),
        mode: "onChange",
    });

    const onSubmit = async (data: SignUpFormValues) => {
        if (!isRequiredChecked) {
            toast.error("필수 약관에 동의해주세요.");
            return;
        }
        signupMutate(data);
    };

    return (
        <div className="flex flex-col justify-center w-full max-w-md px-4 md:px-0 gap-8 mb-14">
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
                </div>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="w-full flex flex-col items-center justify-center gap-6"
                >
                    <div className="w-full flex flex-col gap-2">
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-muted-foreground font-bold text-sm">
                                이메일 주소
                            </Label>
                            <Input
                                placeholder="'@' 포함 이메일 주소 입력'"
                                className="h-12.5"
                                {...register("email")}
                            />
                            <div className="h-5">
                                {errors.email && (
                                    <p className="text-xs text-destructive">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-muted-foreground font-bold text-sm">
                                비밀번호
                            </Label>
                            <div className="relative">
                                <Input
                                    {...register("password")}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="영문, 숫자, 특수문자 10~15자"
                                    className="h-12.5 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <div className="h-5">
                                {errors.password && (
                                    <p className="text-xs text-destructive">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <Label className="text-muted-foreground font-bold text-sm">
                                비밀번호 확인
                            </Label>
                            <div className="relative">
                                <Input
                                    {...register("confirmPassword")}
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="비밀번호를 다시 입력해주세요."
                                    className="h-12.5 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCofirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff size={20} />
                                    ) : (
                                        <Eye size={20} />
                                    )}
                                </button>
                            </div>
                            <div className="h-5">
                                {errors.confirmPassword && (
                                    <p className="text-xs text-destructive">
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 약관 동의 영역 */}
                    <div className="w-full flex flex-col gap-3 py-4 border-y border-gray-100">
                        <div className="flex items-center space-x-2 pb-2">
                            <Checkbox
                                id="all-agree"
                                checked={isAllChecked}
                                onCheckedChange={handleAllCheck}
                            />
                            <Label htmlFor="all-agree" className="text-sm font-bold cursor-pointer">
                                모두 확인, 동의합니다
                            </Label>
                        </div>
                        {AGREEMENTS.map(({ id, title, required, content }) => (
                            <div key={id} className="flex items-center justify-between group">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id={id}
                                        checked={agreements[id]}
                                        onCheckedChange={(checked) => handleSingleCheck(id, checked as boolean)}
                                    />
                                    <Label htmlFor={id} className="text-sm text-gray-600 cursor-pointer flex items-center gap-1.5">
                                        <span className={required ? "text-blue-600 font-medium" : "text-gray-400"}>
                                            {required ? "(필수)" : "(선택)"}
                                        </span>
                                        {title}
                                    </Label>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setModalContent({ title, content })}
                                    className="p-1 text-gray-300 hover:text-gray-600 transition-colors cursor-pointer"
                                    aria-label={`${title} 내용 보기`}
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    <Button
                        disabled={signupIsPending || !isRequiredChecked}
                        type="submit"
                        className="w-full h-12.5 cursor-pointer"
                    >
                        회원가입
                    </Button>
                </form>
            </div>

            <TermsModal
                isOpen={modalContent !== null}
                onClose={() => setModalContent(null)}
                title={modalContent?.title ?? ""}
                content={modalContent?.content ?? ""}
            />
        </div>
    );
}
