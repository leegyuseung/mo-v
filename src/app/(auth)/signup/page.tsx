"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowCofirmPassword] = useState(false);

  return (
    <div className="flex flex-col justify-center min-w-112.5 gap-8 mb-14">
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
        <div className="w-full flex flex-col items-center justify-center gap-6">
          <div className="w-full flex flex-col gap-2">
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground font-bold text-sm">
                이메일 주소
              </Label>
              <Input
                placeholder="'@' 포함 이메일 주소 입력'"
                className="h-12.5"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground font-bold text-sm">
                비밀번호
              </Label>
              <div className="relative">
                <Input
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
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-muted-foreground font-bold text-sm">
                비밀번호 확인
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
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
            </div>
          </div>
          <Button className="w-full h-12.5 cursor-pointer">회원가입</Button>
        </div>
      </div>
    </div>
  );
}
