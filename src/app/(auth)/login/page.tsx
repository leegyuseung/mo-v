"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

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
          <span className="text-lg text-muted-foreground">
            로그인 후 더 많은 서비스를 즐겨보세요.
          </span>
        </div>
        <div className="w-full flex flex-col items-center justify-center gap-6">
          <div className="w-full flex flex-col gap-2">
            <Input placeholder="아이디" className="h-12.5" />
            <Input placeholder="비밀번호" className="h-12.5" />
          </div>
          <Button className="w-full h-12.5 cursor-pointer">로그인</Button>
        </div>
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
