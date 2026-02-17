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
    <div className="flex items-center justify-between px-3 md:px-6 h-16 w-full bg-white">
      <div className="flex items-center gap-2">
        {/* 모바일 사이드바 토글 버튼 */}
        <button
          onClick={toggleSidebar}
          className="md:hidden p-1.5 rounded-lg hover:bg-sidebar-accent cursor-pointer transition-colors"
          aria-label="메뉴 열기"
        >
          <Menu className="w-5 h-5 text-gray-700" />
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
        <button
          type="button"
          aria-label="즐겨찾기(준비중)"
          className="h-10 w-10 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer"
        >
          <Star className="w-4 h-4" />
        </button>
        <button
          type="button"
          aria-label="출석 이벤트(준비중)"
          className="h-10 w-10 inline-flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 cursor-pointer"
        >
          <CalendarDays className="w-4 h-4" />
        </button>
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
