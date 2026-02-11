"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSignInWithPassword } from "@/hooks/mutations/auth/use-sign-in-with-password";
import { toast } from "sonner";

export default function LoginPage() {
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
          <button className="cursor-pointer hover:bg-sidebar-accent rounded-sm">
            아이디 찾기
          </button>
          <div>|</div>
          <button className="cursor-pointer hover:bg-sidebar-accent rounded-sm">
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
      <div className="flex justify-center gap-4">
        <button className="cursor-pointer">
          <Image
            src={"/naver_login_icon.png"}
            alt="naver_login_icon"
            height={56}
            width={56}
            priority
          />
        </button>
        <button className="cursor-pointer">
          <Image
            src={"/kakao_login_icon.png"}
            alt="kakao_login_icon"
            height={56}
            width={56}
            priority
          />
        </button>
      </div>
    </div>
  );
}

