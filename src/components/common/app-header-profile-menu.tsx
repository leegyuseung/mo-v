"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import type { HeartPoints, Profile } from "@/types/profile";
import { ChevronRight, Heart, LogOut, UserRound } from "lucide-react";

type AppHeaderProfileMenuProps = {
  user: SupabaseUser;
  profile: Profile | null;
  heartPoints: HeartPoints | null;
  isSigningOut: boolean;
  onSignOut: () => void;
};

export default function AppHeaderProfileMenu({
  user,
  profile,
  heartPoints,
  isSigningOut,
  onSignOut,
}: AppHeaderProfileMenuProps) {
  const [isCardOpen, setIsCardOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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
    <div className="relative" ref={cardRef}>
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
          <UserRound className="w-5 h-5" />
        )}
        <span className="hidden md:inline">
          {profile?.nickname || user.email || "사용자"}
        </span>
      </button>

      {isCardOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50">
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
                <UserRound className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">
                {profile?.nickname || user.email || "사용자"}
                {profile?.nickname_code ? ` #${profile.nickname_code}` : ""}
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
                {heartPoints?.point?.toLocaleString() || 0} 하트
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </Link>

          <button
            onClick={() => {
              setIsCardOpen(false);
              onSignOut();
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
  );
}
