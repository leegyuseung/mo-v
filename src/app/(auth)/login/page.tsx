import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-w-80 gap-8">
      <div className="flex flex-col items-center justify-center">
        <Image src={"/logo.png"} alt="logo" height={85} width={150} priority />
        <span className="text-lg text-muted-foreground">
          로그인 후 더 많은 서비스를 즐겨보세요.
        </span>
      </div>
      <div className="flex gap-4">
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
