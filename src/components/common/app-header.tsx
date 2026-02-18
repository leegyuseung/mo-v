"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useSignOut } from "@/hooks/mutations/auth/use-sign-out";
import { CalendarDays, Menu, Star } from "lucide-react";
import { useSidebar } from "../ui/sidebar";
import AppHeaderProfileMenu from "@/components/common/app-header-profile-menu";

export default function AppHeader() {
  const router = useRouter();
  const { user, profile, heartPoints, isLoading } = useAuthStore();
  const { mutate: signOut, isPending: isSigningOut } = useSignOut();
  const { toggleSidebar } = useSidebar();

  return (
    <div className="relative z-30 flex items-center justify-between px-3 md:px-6 h-[72px] w-full bg-white">
      <div className="flex items-center gap-2">
        <button
          onClick={toggleSidebar}
          className="md:-ml-3 h-10 w-10 inline-flex items-center justify-center rounded-lg cursor-pointer text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="메뉴 열기"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link href={"/"}>
          <Image
            src={"/logo.png"}
            alt=""
            height={72}
            width={72}
            loading="eager"
            priority
            className="cursor-pointer"
          />
        </Link>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <div className="group relative">
          <button
            type="button"
            aria-label="즐겨찾기(준비중)"
            className="h-10 w-10 inline-flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer"
          >
            <Star className="w-4 h-4" />
          </button>
          <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
            즐겨찾기
          </span>
        </div>
        <div className="group relative">
          <button
            type="button"
            aria-label="출석 이벤트(준비중)"
            className="h-10 w-10 inline-flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer"
          >
            <CalendarDays className="w-4 h-4" />
          </button>
          <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
            출석이벤트
          </span>
        </div>
        {isLoading ? (
          <div className="w-16 md:w-20 h-8 bg-gray-100 animate-pulse rounded-xl" />
        ) : user ? (
          <AppHeaderProfileMenu
            user={user}
            profile={profile}
            heartPoints={heartPoints}
            isSigningOut={isSigningOut}
            onSignOut={signOut}
          />
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="h-10 rounded-xl px-3 cursor-pointer text-sm hover:bg-sidebar-accent"
          >
            로그인
          </button>
        )}
      </div>
    </div>
  );
}
