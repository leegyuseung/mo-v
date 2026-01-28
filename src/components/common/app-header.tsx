import Image from "next/image";
import Link from "next/link";

export default function AppHeader() {
  return (
    <div className="flex items-center justify-between px-6 h-16 w-full bg-white">
      <div>
        <Link href={"/"}>
          <Image
            src={"/logo.png"}
            alt=""
            height={64}
            width={64}
            className="cursor-pointer"
          />
        </Link>
      </div>
      <div>
        <Link href={"/login"}>
          <span className="cursor-pointer">로그인</span>
        </Link>
      </div>
    </div>
  );
}
