"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpFormValues, signUpSchema } from "@/utils/schema";
import { useSignUp } from "@/hooks/mutations/auth/use-sign-up";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { TermsModal } from "./terms-modal";
import SignupPasswordField from "@/components/screens/auth/signup-password-field";
import SignupAgreementsSection from "@/components/screens/auth/signup-agreements-section";
import {
    getSignupErrorMessage,
    INITIAL_SIGNUP_AGREEMENTS_STATE,
    SIGNUP_AGREEMENTS,
} from "@/components/screens/auth/signup-screen-constants";
import type { AgreementId, SignUpAgreementsState, TermsModalContent } from "@/types/signup-screen";

export default function SignupScreen() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();

    const [agreements, setAgreements] = useState<SignUpAgreementsState>(INITIAL_SIGNUP_AGREEMENTS_STATE);
    const [modalContent, setModalContent] = useState<TermsModalContent>(null);

    const isAllChecked = Object.values(agreements).every(Boolean);
    const isRequiredChecked = SIGNUP_AGREEMENTS.filter((agreement) => agreement.required).every((agreement) => agreements[agreement.id]);

    const handleAllCheck = (checked: boolean) => {
        const nextState = SIGNUP_AGREEMENTS.reduce((acc, agreement) => {
            acc[agreement.id] = checked;
            return acc;
        }, {} as SignUpAgreementsState);
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
            const errorCode = (error as { code?: string })?.code;
            const errorMessage = getSignupErrorMessage(errorCode);
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
                        <SignupPasswordField
                            label="비밀번호"
                            fieldName="password"
                            placeholder="영문, 숫자, 특수문자 10~15자"
                            register={register}
                            visible={showPassword}
                            onToggleVisible={() => setShowPassword((prev) => !prev)}
                            errorMessage={errors.password?.message}
                        />
                        <SignupPasswordField
                            label="비밀번호 확인"
                            fieldName="confirmPassword"
                            placeholder="비밀번호를 다시 입력해주세요."
                            register={register}
                            visible={showConfirmPassword}
                            onToggleVisible={() => setShowConfirmPassword((prev) => !prev)}
                            errorMessage={errors.confirmPassword?.message}
                        />
                    </div>

                    <SignupAgreementsSection
                        agreements={agreements}
                        isAllChecked={isAllChecked}
                        onToggleAll={handleAllCheck}
                        onToggleSingle={handleSingleCheck}
                        onOpenTermsModal={(title, content) => setModalContent({ title, content })}
                    />

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
