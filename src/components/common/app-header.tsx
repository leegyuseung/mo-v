"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AppHeader() {
  const router = useRouter();

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
      <button
        onClick={() => router.push("/login")}
        className="rounded-xl px-2 py-2 cursor-pointer text-sm hover:bg-sidebar-accent"
      >
        로그인
      </button>
    </div>
  );
}
