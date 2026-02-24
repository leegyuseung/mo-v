"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { useSignOut } from "@/hooks/mutations/auth/use-sign-out";
import { Bell, CalendarDays, Gift, Menu, MessageCircle, Star, X } from "lucide-react";
import { useSidebar } from "../ui/sidebar";
import AppHeaderProfileMenu from "@/components/common/app-header-profile-menu";
import AnimatedGiftIcon from "@/components/common/animated-gift-icon";
import AnimatedRewardHeart from "@/components/common/animated-reward-heart";
import { claimDailyGiftBox, fetchDailyGiftBoxStatus } from "@/api/event";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function AppHeader() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, profile, heartPoints, isLoading, setHeartPoints } = useAuthStore();
  const { mutate: signOut, isPending: isSigningOut } = useSignOut();
  const { toggleSidebar } = useSidebar();
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [isGiftOpening, setIsGiftOpening] = useState(false);
  const [giftAmount, setGiftAmount] = useState<number | null>(null);
  const [isGiftChecking, setIsGiftChecking] = useState(false);

  const onClickGiftEvent = async () => {
    if (!user) {
      toast.error("로그인 후 참여할 수 있습니다.");
      return;
    }
    if (isGiftChecking) return;

    setIsGiftChecking(true);
    try {
      const status = await fetchDailyGiftBoxStatus();
      if (status.claimedToday) {
        toast.info(
          status.amount
            ? `오늘은 이미 선물 이벤트에 참여했습니다. (획득: ${status.amount.toLocaleString()}하트)`
            : "오늘은 이미 선물 이벤트에 참여했습니다."
        );
        return;
      }
      setGiftAmount(null);
      setIsGiftModalOpen(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "이벤트 상태를 확인하지 못했습니다.";
      toast.error(message);
    } finally {
      setIsGiftChecking(false);
    }
  };

  const openGiftBox = async () => {
    if (isGiftOpening || giftAmount !== null) return;

    setIsGiftOpening(true);
    try {
      const result = await claimDailyGiftBox();
      // 이미 상태가 반영된 서버값으로 바로 갱신한다.
      setHeartPoints({
        id: user!.id,
        point: result.afterPoint ?? heartPoints?.point ?? 0,
        created_at: heartPoints?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      await queryClient.invalidateQueries({
        queryKey: ["heartPointHistory", user!.id],
      });

      setTimeout(() => {
        setGiftAmount(result.amount);
        setIsGiftOpening(false);
      }, 900);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "선물 이벤트 처리에 실패했습니다.";
      toast.error(message);
      setIsGiftOpening(false);
      setIsGiftModalOpen(false);
    }
  };

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
      <div className="flex items-center gap-1.5 md:gap-3">
        <div className="group relative">
          <Link
            href="/star"
            aria-label="즐겨찾기"
            className="h-9 w-9 md:h-10 md:w-10 inline-flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer"
          >
            <Star className="w-4 h-4" />
          </Link>
          <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hidden md:block">
            즐겨찾기
          </span>
        </div>
        <div className="group relative hidden md:block">
          <button
            type="button"
            aria-label="출석 이벤트(준비중)"
            className="h-10 w-10 inline-flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer"
          >
            <CalendarDays className="w-4 h-4" />
          </button>
          <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
            출석이벤트 (준비중)
          </span>
        </div>
        <div className="group relative">
          <button
            type="button"
            aria-label="선물 이벤트"
            onClick={onClickGiftEvent}
            className="h-9 w-9 md:h-10 md:w-10 inline-flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer"
          >
            <Gift className="w-4 h-4" />
          </button>
          <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hidden md:block">
            선물 이벤트 (1~50하트)
          </span>
        </div>
        <div className="group relative hidden md:block">
          <button
            type="button"
            aria-label="메시지 (준비중)"
            className="h-10 w-10 inline-flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
          </button>
          <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
            메시지 (준비중)
          </span>
        </div>
        <div className="group relative hidden md:block">
          <button
            type="button"
            aria-label="알림(준비중)"
            className="h-10 w-10 inline-flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer"
          >
            <Bell className="w-4 h-4" />
          </button>
          <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
            알림 (준비중)
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

      {isGiftModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-gray-900">선물 이벤트</h3>
              <button
                type="button"
                onClick={() => setIsGiftModalOpen(false)}
                className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-gray-500 hover:bg-gray-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-4">
              <p className="text-sm text-gray-500">하루 한 번 선물상자를 열고 하트를 받아보세요.</p>
              <p className="mt-1 text-xs font-medium text-rose-500">랜덤 1~50하트</p>
            </div>

            <div className="mb-5 flex min-h-[180px] items-center justify-center">
              {giftAmount === null ? (
                <button
                  type="button"
                  onClick={openGiftBox}
                  disabled={isGiftOpening}
                  className={`relative inline-flex h-28 w-28 items-center justify-center rounded-2xl bg-white text-gray-900 transition ${isGiftOpening ? "scale-110 animate-pulse" : "hover:scale-105"
                    }`}
                >
                  <AnimatedGiftIcon className="h-20 w-20 text-black cursor-pointer" />
                </button>
              ) : (
                <div className="text-center">
                  <AnimatedRewardHeart className="mx-auto mb-2" />
                  <p className="text-sm text-gray-500">오늘 받은 하트</p>
                  <p className="mt-1 text-3xl font-bold text-red-600">
                    {giftAmount.toLocaleString()}하트
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              {giftAmount === null ? (
                <Button
                  type="button"
                  onClick={openGiftBox}
                  disabled={isGiftOpening}
                  className="cursor-pointer bg-black hover:bg-gray-900 text-white"
                >
                  {isGiftOpening ? "상자 여는 중..." : "상자 열기"}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => setIsGiftModalOpen(false)}
                  className="cursor-pointer bg-gray-800 hover:bg-gray-900 text-white"
                >
                  확인
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
