"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useSignOut } from "@/hooks/mutations/auth/use-sign-out";
import { User, LogOut } from "lucide-react";

export default function AppHeader() {
  const router = useRouter();
  const { user, profile, isLoading } = useAuthStore();
  const { mutate: signOut, isPending: isSigningOut } = useSignOut();

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
      <div className="flex items-center gap-3">
        {isLoading ? (
          <div className="w-20 h-8 bg-gray-100 animate-pulse rounded-xl" />
        ) : user ? (
          <>
            <div className="flex items-center gap-2 text-sm text-gray-700">
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
              <span>{profile?.nickname || "사용자"}</span>
            </div>
            <button
              onClick={() => signOut()}
              disabled={isSigningOut}
              className="flex items-center gap-1 rounded-xl px-3 py-2 cursor-pointer text-sm hover:bg-sidebar-accent disabled:opacity-50"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </button>
          </>
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

