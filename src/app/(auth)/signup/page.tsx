"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpFormValues, signUpSchema } from "@/utils/schema";
import { useSignUp } from "@/hooks/mutations/auth/use-sign-up";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowCofirmPassword] = useState(false);
  const router = useRouter();

  const { mutate: signupMutate, isPending: signupIsPending } = useSignUp({
    onSuccess: () => {
      toast.success("회원가입 메일이 발송되었습니다. 메일함을 확인해주세요!", {
        position: "top-center",
      });

      router.replace("/login");
    },
    onError: (error) => {
      const errorCode = error.code;
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
    console.log("서버로 전송할 데이터:", data);
    signupMutate(data);
  };

  return (
    <div className="flex flex-col justify-center w-full max-w-md px-4 md:px-0 gap-8 mb-14">
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="flex flex-col items-center justify-center">
          <Image
            src={"/logo.png"}
            alt="logo"
            height={85}
            width={150}
            priority
          />
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
          <Button
            disabled={signupIsPending}
            type="submit"
            className="w-full h-12.5 cursor-pointer"
          >
            회원가입
          </Button>
        </form>
      </div>
    </div>
  );
}
