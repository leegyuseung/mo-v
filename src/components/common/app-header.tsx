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
import { PanelLeft, PanelLeftClose } from "lucide-react";
import { useSidebar } from "../ui/sidebar";
import AppHeaderProfileMenu from "@/components/common/app-header-profile-menu";
import GiftEventModal from "@/components/common/gift-event-modal";
import LiveBoxScheduleCalendarModal from "@/components/common/live-box-schedule-calendar-modal";
import { HEART_HISTORY_REFRESH_SIGNAL_KEY } from "@/components/screens/history/history-screen-utils";
import { getHeartPointHistoryQueryKey } from "@/hooks/queries/heart/use-heart-point-history";
import { useLiveBoxes } from "@/hooks/queries/live-box/use-live-boxes";
import AppHeaderActionIcons from "@/components/common/app-header-action-icons";
import { toast } from "sonner";

export default function AppHeader() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, profile, heartPoints, isLoading, setHeartPoints } = useAuthStore();
  const { mutate: signOut, isPending: isSigningOut } = useSignOut();
  const { toggleSidebar, isMobile, open, openMobile } = useSidebar();
  const isSidebarOpen = isMobile ? openMobile : open;
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleModalOpenKey, setScheduleModalOpenKey] = useState(0);
  const [isGiftOpening, setIsGiftOpening] = useState(false);
  const [giftAmount, setGiftAmount] = useState<number | null>(null);
  const { data: liveBoxes = [], isLoading: isLiveBoxesLoading } = useLiveBoxes(isScheduleModalOpen);
  const { mutateAsync: checkDailyGiftBoxStatus, isPending: isGiftChecking } =
    useCheckDailyGiftBoxStatus();
  const { mutateAsync: claimGiftBox } = useClaimDailyGiftBox();

  /** 선물 이벤트 버튼 클릭 — 현재 회차 참여 여부 확인 후 모달을 연다 */
  const onClickGiftEvent = async () => {
    if (!user) {
      toast.error("로그인 후 참여할 수 있습니다.");
      return;
    }
    if (isGiftChecking) return;

    try {
      const status = await checkDailyGiftBoxStatus();
      if (status.claimedInCurrentWindow) {
        toast.info(
          status.amount
            ? `${status.windowLabel || "현재 회차"} 선물 이벤트는 이미 참여했습니다. (획득: ${status.amount.toLocaleString()}하트)`
            : `${status.windowLabel || "현재 회차"} 선물 이벤트는 이미 참여했습니다.`
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
      const historyQueryKey = getHeartPointHistoryQueryKey(user!.id);
      await queryClient.invalidateQueries({ queryKey: historyQueryKey, exact: true });
      await queryClient.refetchQueries({ queryKey: historyQueryKey, exact: true, type: "active" });
      localStorage.setItem(HEART_HISTORY_REFRESH_SIGNAL_KEY, String(Date.now()));

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
          aria-label={isSidebarOpen ? "메뉴 닫기" : "메뉴 열기"}
        >
          {isSidebarOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
        </button>
        <Link href={"/"}>
          <Image
            src={"/logo.png"}
            alt=""
            height={72}
            width={72}
            sizes="72px"
            priority
            className="cursor-pointer"
          />
        </Link>
      </div>
      <div className="flex items-center gap-1.5 md:gap-3">
        <AppHeaderActionIcons
          onClickGiftEvent={onClickGiftEvent}
          onOpenSchedule={() => {
            setScheduleModalOpenKey((previous) => previous + 1);
            setIsScheduleModalOpen(true);
          }}
        />
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
      <LiveBoxScheduleCalendarModal
        key={`live-box-schedule-modal-${scheduleModalOpenKey}`}
        open={isScheduleModalOpen}
        liveBoxes={liveBoxes}
        isLoading={isLiveBoxesLoading}
        onClose={() => setIsScheduleModalOpen(false)}
      />
    </div>
  );
}
