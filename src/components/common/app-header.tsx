"use client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { useSignOut } from "@/hooks/mutations/auth/use-sign-out";
import { useCheckDailyGiftBoxStatus } from "@/hooks/mutations/event/use-check-daily-gift-box-status";
import { useClaimDailyGiftBox } from "@/hooks/mutations/event/use-claim-daily-gift-box";
import { Bell, Gift, Mail, Menu, Star } from "lucide-react";
import { useSidebar } from "../ui/sidebar";
import AppHeaderProfileMenu from "@/components/common/app-header-profile-menu";
import GiftEventModal from "@/components/common/gift-event-modal";
import { toast } from "sonner";

export default function AppHeader() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, profile, heartPoints, isLoading, setHeartPoints } = useAuthStore();
  const { mutate: signOut, isPending: isSigningOut } = useSignOut();
  const { toggleSidebar } = useSidebar();
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [isGiftOpening, setIsGiftOpening] = useState(false);
  const [giftAmount, setGiftAmount] = useState<number | null>(null);
  const { mutateAsync: checkDailyGiftBoxStatus, isPending: isGiftChecking } =
    useCheckDailyGiftBoxStatus();
  const { mutateAsync: claimGiftBox } = useClaimDailyGiftBox();

  /** 선물 이벤트 버튼 클릭 — 오늘 참여 여부 확인 후 모달을 연다 */
  const onClickGiftEvent = async () => {
    if (!user) {
      toast.error("로그인 후 참여할 수 있습니다.");
      return;
    }
    if (isGiftChecking) return;

    try {
      const status = await checkDailyGiftBoxStatus();
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
    }
  };

  /** 선물상자 열기 — API 호출 후 하트 포인트 갱신 */
  const openGiftBox = async () => {
    if (isGiftOpening || giftAmount !== null) return;

    setIsGiftOpening(true);
    try {
      const result = await claimGiftBox();
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
            <Star className="w-4 h-4 text-black" />
          </Link>
          <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hidden md:block">
            즐겨찾기
          </span>
        </div>
        <div className="group relative">
          <button
            type="button"
            aria-label="선물 이벤트"
            onClick={onClickGiftEvent}
            className="h-9 w-9 md:h-10 md:w-10 inline-flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer"
          >
            <Gift className="w-4 h-4 text-black" />
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
            <Mail className="w-4 h-4" />
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

      <GiftEventModal
        open={isGiftModalOpen}
        giftAmount={giftAmount}
        isGiftOpening={isGiftOpening}
        onOpenGiftBox={openGiftBox}
        onClose={() => setIsGiftModalOpen(false)}
      />
    </div>
  );
}
