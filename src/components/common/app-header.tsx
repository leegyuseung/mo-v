"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useSignOut } from "@/hooks/mutations/auth/use-sign-out";
import { User, LogOut, Heart, ChevronRight, Menu } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useSidebar } from "../ui/sidebar";

export default function AppHeader() {
  const router = useRouter();
  const { user, profile, heartPoints, isLoading } = useAuthStore();
  const { mutate: signOut, isPending: isSigningOut } = useSignOut();
  const [isCardOpen, setIsCardOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const { toggleSidebar } = useSidebar();

  // 외부 클릭 시 카드 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsCardOpen(false);
      }
    };

    if (isCardOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCardOpen]);

  return (
    <div className="flex items-center justify-between px-3 md:px-6 h-14 md:h-16 w-full bg-white">
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
            height={64}
            width={64}
            className="cursor-pointer"
          />
        </Link>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        {isLoading ? (
          <div className="w-16 md:w-20 h-8 bg-gray-100 animate-pulse rounded-xl" />
        ) : user ? (
          <div className="relative" ref={cardRef}>
            {/* 프로필 클릭 영역 */}
            <button
              onClick={() => setIsCardOpen(!isCardOpen)}
              className="flex items-center gap-1.5 md:gap-2 text-sm text-gray-700 px-2 md:px-3 py-2 rounded-xl hover:bg-sidebar-accent cursor-pointer transition-colors"
            >
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt="avatar"
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              ) : (
                <User className="w-5 h-5" />
              )}
              <span className="hidden md:inline">
                {profile?.nickname || "사용자"}
              </span>
            </button>

            {/* 프로필 카드 드롭다운 */}
            {isCardOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50">
                {/* 프로필 정보 영역 */}
                <div className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4 border-b border-gray-100">
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt="avatar"
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {profile?.nickname || "사용자"}
                    </p>
                    <Link
                      href="/profile"
                      onClick={() => setIsCardOpen(false)}
                      className="text-sm text-blue-500 hover:text-blue-600 flex items-center gap-0.5"
                    >
                      내 프로필 가기
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* 하트 포인트 */}
                <Link
                  href="/history"
                  onClick={() => setIsCardOpen(false)}
                  className="px-3 sm:px-4 py-3 flex items-center justify-between border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2 text-gray-600">
                    <Heart className="w-5 h-5 text-red-400 fill-red-400" />
                    <span className="text-sm">내 하트</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-900">
                      {heartPoints?.point?.toLocaleString() || 0} P
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </Link>

                {/* 로그아웃 */}
                <button
                  onClick={() => {
                    setIsCardOpen(false);
                    signOut();
                  }}
                  disabled={isSigningOut}
                  className="w-full px-3 sm:px-4 py-3 flex items-center gap-2 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm">로그아웃</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => router.push("/login")}
            className="rounded-xl px-2 py-2 cursor-pointer text-sm hover:bg-sidebar-accent"
          >
            로그인
          </button>
        )}
      </div>
    </div>
  );
}
