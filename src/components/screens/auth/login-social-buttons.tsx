import Image from "next/image";
import type { LoginSocialButtonsProps } from "@/types/login-screen";

export default function LoginSocialButtons({
  isSocialSigningIn,
  lastProvider,
  onSocialLogin,
  providers,
}: LoginSocialButtonsProps) {
  return (
    <div className="flex justify-center gap-3 md:gap-4">
      {providers.map(({ provider, src, alt }) => (
        <div key={alt} className="relative">
          <button
            type="button"
            onClick={() => onSocialLogin(provider)}
            disabled={isSocialSigningIn}
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
          {lastProvider === provider ? (
            <span className="absolute -top-2 -right-2 whitespace-nowrap rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
              최근 사용
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
