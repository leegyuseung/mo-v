"use client";

import Link from "next/link";
import { useState } from "react";
import { useStreamerDetail } from "@/hooks/queries/streamers/use-streamer-detail";
import { useIdolGroupCodeNames } from "@/hooks/queries/groups/use-idol-group-code-names";
import { useCrewCodeNames } from "@/hooks/queries/crews/use-crew-code-names";
import { useCreateStreamerInfoEditRequest } from "@/hooks/mutations/streamers/use-create-streamer-info-edit-request";
import { useCreateEntityReportRequest } from "@/hooks/mutations/reports/use-create-entity-report-request";
import { useToggleStar } from "@/hooks/mutations/star/use-toggle-star";
import { useGiftModal } from "@/hooks/vlist/use-gift-modal";
import { useAuthStore } from "@/store/useAuthStore";
import { useStreamerReceivedHeartTotal } from "@/hooks/queries/heart/use-streamer-received-heart-total";
import { useStarCount } from "@/hooks/queries/star/use-star-count";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { ArrowBigLeft, Heart, Siren, Star, UserRoundPen } from "lucide-react";
import { toast } from "sonner";
import {
  ENTITY_REPORT_MODAL_TEXT,
  STREAMER_INFO_EDIT_REQUEST_MODAL_TEXT,
} from "@/lib/constant";
import InfoEditRequestModal from "@/components/common/info-edit-request-modal";
import ReportRequestModal from "@/components/common/report-request-modal";
import StreamerProfileCard from "./streamer-profile-card";
import TopDonorsSection from "./top-donors-section";
import GiftHeartModal from "./gift-heart-modal";
import type { VlistDetailScreenProps } from "@/types/streamer";

export default function VlistDetailScreen({
  streamerPublicId,
}: VlistDetailScreenProps) {
  const [isEditRequestModalOpen, setIsEditRequestModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { data: streamer, isLoading } = useStreamerDetail(streamerPublicId);
  const { user, profile } = useAuthStore();
  const {
    mutateAsync: createInfoEditRequest,
    isPending: isInfoEditRequestSubmitting,
  } = useCreateStreamerInfoEditRequest();
  const {
    mutateAsync: createReportRequest,
    isPending: isReportSubmitting,
  } = useCreateEntityReportRequest();
  const { data: idolGroups } = useIdolGroupCodeNames();
  const { data: crews } = useCrewCodeNames();
  const { data: receivedHeartTotal = 0, isLoading: isReceivedHeartTotalLoading } =
    useStreamerReceivedHeartTotal(streamer?.id);
  const { data: streamerStarCount = 0, isLoading: isStreamerStarCountLoading } = useStarCount(
    streamer?.id,
    "streamer"
  );
  const { starred: isStarred, isToggling: isStarToggling, toggle: onClickStar } = useToggleStar("streamer", streamer?.id);
  const giftModal = useGiftModal(streamer);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!streamer) {
    return <div className="p-6 text-center text-gray-400">버츄얼 정보가 없습니다.</div>;
  }

  /* ─── 플랫폼 보정 ─── */
  const canonicalPlatform: "chzzk" | "soop" =
    streamer.platform_url?.includes("sooplive.co.kr") ||
      (!!streamer.soop_id && !streamer.chzzk_id)
      ? "soop"
      : streamer.platform_url?.includes("chzzk.naver.com") ||
        (!!streamer.chzzk_id && !streamer.soop_id)
        ? "chzzk"
        : streamer.platform === "soop"
          ? "soop"
          : "chzzk";

  const platformHref =
    streamer.platform_url ||
    (canonicalPlatform === "chzzk" && streamer.chzzk_id
      ? `https://chzzk.naver.com/live/${streamer.chzzk_id}`
      : canonicalPlatform === "soop" && streamer.soop_id
        ? `https://www.sooplive.co.kr/station/${streamer.soop_id}`
        : "");
  const platformIconSrc =
    canonicalPlatform === "chzzk" ? "/icons/chzzk.svg" : "/icons/soop.svg";
  const toneContainerClass =
    canonicalPlatform === "chzzk" ? "border-green-100 bg-green-50/30" : "border-blue-100 bg-blue-50/30";
  const tonePanelClass =
    canonicalPlatform === "chzzk" ? "border-green-100 bg-green-50/40" : "border-blue-100 bg-blue-50/40";
  const toneButtonClass =
    canonicalPlatform === "chzzk" ? "border-green-200 bg-green-50 hover:bg-green-100" : "border-blue-200 bg-blue-50 hover:bg-blue-100";

  /* ─── 그룹/소속 태그 ─── */
  const groupNameByCode = new Map<string, string>();
  (idolGroups || []).forEach((group) => {
    groupNameByCode.set(group.group_code.trim().toLowerCase(), group.name);
  });
  const groupTags: Array<{ code: string; name: string }> =
    streamer.group_name
      ?.filter((group: unknown): group is string => Boolean(group))
      .map((group: string) => {
        const code = group.trim().toLowerCase();
        return { code, name: groupNameByCode.get(code) || group };
      }) ?? [];

  const crewTags = streamer.crew_name?.filter(Boolean) ?? [];
  const crewNameByCode = new Map<string, string>();
  const crewCodeByName = new Map<string, string>();
  (crews || []).forEach((crew) => {
    const code = crew.crew_code.trim().toLowerCase();
    const name = crew.name.trim();
    crewNameByCode.set(code, name);
    crewCodeByName.set(name.toLowerCase(), code);
  });
  const crewLinkItems: Array<{ code: string; name: string }> = crewTags.map((rawCrew: string) => {
    const normalizedCrew = rawCrew.trim().toLowerCase();
    const crewCode =
      crewNameByCode.has(normalizedCrew)
        ? normalizedCrew
        : crewCodeByName.get(normalizedCrew) || normalizedCrew;
    return { code: crewCode, name: crewNameByCode.get(crewCode) || rawCrew };
  });
  const identityTags = [
    ...groupTags.map((group) => ({
      type: "group" as const,
      name: group.name,
      href: `/group/${group.code}`,
    })),
    ...crewLinkItems.map((crew) => ({
      type: "crew" as const,
      name: crew.name,
      href: `/crew/${encodeURIComponent(crew.code)}`,
    })),
  ];

  /* ─── 모달 핸들러 ─── */
  const openInfoEditRequestModal = () => {
    if (!user) { toast.error("로그인 후 정보 수정 요청이 가능합니다."); return; }
    setIsEditRequestModalOpen(true);
  };
  const openReportModal = () => {
    if (!user) { toast.error("로그인 후 신고가 가능합니다."); return; }
    setIsReportModalOpen(true);
  };
  const handleSubmitReport = async (content: string) => {
    if (!user) { toast.error("로그인 후 신고가 가능합니다."); return; }
    try {
      await createReportRequest({
        targetType: "streamer",
        targetCode: streamer.public_id || String(streamer.id),
        targetName: streamer.nickname || "버츄얼",
        reporterId: user.id,
        reporterNickname: profile?.nickname || null,
        content,
      });
      toast.success(ENTITY_REPORT_MODAL_TEXT.submitSuccess);
      setIsReportModalOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "신고 접수에 실패했습니다.";
      toast.error(message);
    }
  };
  const handleSubmitInfoEditRequest = async (content: string) => {
    if (!user) { toast.error("로그인 후 정보 수정 요청이 가능합니다."); return; }
    try {
      await createInfoEditRequest({
        content,
        streamerId: streamer.id,
        streamerNickname: streamer.nickname || "-",
        requesterId: user.id,
        requesterNickname: profile?.nickname || null,
      });
      toast.success(STREAMER_INFO_EDIT_REQUEST_MODAL_TEXT.submitSuccess);
      setIsEditRequestModalOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "정보 수정 요청 접수에 실패했습니다.";
      toast.error(message);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* ─── 상단 액션 바 ─── */}
      <div className="mb-4 flex items-center justify-between">
        <div className="group relative">
          <Link href="/vlist">
            <Button type="button" variant="ghost" size="icon" className="cursor-pointer h-10 w-10">
              <ArrowBigLeft className="w-5 h-5" />
            </Button>
          </Link>
          <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
            뒤로가기
          </span>
        </div>

        <div className="flex items-center gap-1">
          <div className="group relative">
            <Button type="button" variant="ghost" size="icon" className="cursor-pointer h-10 w-10" onClick={openReportModal} disabled={!user}>
              <Siren className="w-5 h-5 text-red-500" />
            </Button>
            <span className="pointer-events-none absolute right-1/2 top-full z-20 mt-1 translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
              신고하기
            </span>
          </div>
          <div className="group relative">
            <Button type="button" variant="ghost" size="icon" className="cursor-pointer h-10 w-10" onClick={onClickStar} disabled={isStarToggling}>
              <Star className={`w-5 h-5 ${isStarred ? "fill-yellow-400 text-yellow-400" : "text-yellow-500"}`} />
            </Button>
            <span className="pointer-events-none absolute right-1/2 top-full z-20 mt-1 translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
              즐겨찾기
            </span>
          </div>
          <div className="group relative">
            <Button type="button" variant="ghost" size="icon" className="cursor-pointer h-10 w-10" onClick={giftModal.openGiftModal} disabled={!user}>
              <Heart className="w-5 h-5 fill-red-500 text-red-500" />
            </Button>
            <span className="pointer-events-none absolute right-1/2 top-full z-20 mt-1 translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
              하트선물하기
            </span>
          </div>
          <div className="group relative">
            <Button type="button" variant="ghost" size="icon" className="cursor-pointer h-10 w-10" onClick={openInfoEditRequestModal} disabled={!user}>
              <UserRoundPen className="w-5 h-5" />
            </Button>
            <span className="pointer-events-none absolute right-1/2 top-full z-20 mt-1 translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
              정보수정요청
            </span>
          </div>
        </div>
      </div>

      {/* ─── 프로필 카드 ─── */}
      <StreamerProfileCard
        streamer={streamer}
        canonicalPlatform={canonicalPlatform}
        platformHref={platformHref}
        platformIconSrc={platformIconSrc}
        toneContainerClass={toneContainerClass}
        tonePanelClass={tonePanelClass}
        toneButtonClass={toneButtonClass}
        identityTags={identityTags}
        groupTags={groupTags}
        crewLinkItems={crewLinkItems}
        receivedHeartTotal={receivedHeartTotal}
        isReceivedHeartTotalLoading={isReceivedHeartTotalLoading}
        streamerStarCount={streamerStarCount}
        isStreamerStarCountLoading={isStreamerStarCountLoading}
      />

      {/* ─── 하트 선물 TOP 5 ─── */}
      <TopDonorsSection streamerId={streamer.id} />

      {/* ─── 모달 ─── */}
      <InfoEditRequestModal
        open={isEditRequestModalOpen}
        texts={STREAMER_INFO_EDIT_REQUEST_MODAL_TEXT}
        isSubmitting={isInfoEditRequestSubmitting}
        onSubmit={handleSubmitInfoEditRequest}
        onClose={() => setIsEditRequestModalOpen(false)}
      />
      <ReportRequestModal
        open={isReportModalOpen}
        texts={{
          ...ENTITY_REPORT_MODAL_TEXT,
          description:
            "버츄얼 신고 사유를 작성해 주세요. (예: 방송정지, 물의, 장기 미활동 등)",
        }}
        isSubmitting={isReportSubmitting}
        onSubmit={handleSubmitReport}
        onClose={() => setIsReportModalOpen(false)}
      />
      <GiftHeartModal
        open={giftModal.isGiftModalOpen}
        streamerNickname={streamer.nickname || "버츄얼"}
        availableHeartPoint={giftModal.availableHeartPoint}
        giftAmountInput={giftModal.giftAmountInput}
        isGiftSubmitting={giftModal.isGiftSubmitting}
        isGiftConfirmOpen={giftModal.isGiftConfirmOpen}
        onAmountChange={giftModal.handleAmountChange}
        onSetMaxAmount={giftModal.setMaxAmount}
        onClose={giftModal.closeGiftModal}
        onConfirm={giftModal.openGiftConfirm}
        onGiftHeart={giftModal.handleGiftHeart}
        onCancelConfirm={() => giftModal.closeGiftModal()}
      />
    </div>
  );
}
