"use client";

import Link from "next/link";
import { ArrowBigLeft, Eye, Heart, Siren, UserRoundPen } from "lucide-react";
import IconTooltipButton from "@/components/common/icon-tooltip-button";
import InfoEditRequestModal from "@/components/common/info-edit-request-modal";
import ReportRequestModal from "@/components/common/report-request-modal";
import { useContentsDetailActions } from "@/hooks/contents/use-contents-detail-actions";
import { ENTITY_REPORT_MODAL_TEXT, STREAMER_INFO_EDIT_REQUEST_MODAL_TEXT } from "@/lib/constant";
import type { ContentsDetailActionBarProps } from "@/types/contents-detail";

/** 콘텐츠 상세 상단 액션 바 */
export default function ContentsDetailActionBar(props: ContentsDetailActionBarProps) {
  const {
    viewCount,
    isLiked,
    isEnded,
    isReportModalOpen,
    isEditRequestModalOpen,
    isFavoritePending,
    isInfoEditSubmitting,
    isReportSubmitting,
    isAuthor,
    userId,
    openInfoEditRequestModal,
    openReportModal,
    onClickToggleFavorite,
    onCloseInfoEditModal,
    onCloseReportModal,
    handleSubmitReport,
    handleSubmitInfoEditRequest,
  } = useContentsDetailActions(props);

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/contents"
          className="group relative inline-flex h-10 w-10 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          aria-label="뒤로가기"
        >
          <ArrowBigLeft className="h-4 w-4" />
          <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
            뒤로가기
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <IconTooltipButton
            icon={Siren}
            iconClassName="text-red-500"
            label="신고하기"
            onClick={openReportModal}
            disabled={!userId || isEnded}
          />
          <IconTooltipButton
            icon={Heart}
            iconClassName={isLiked ? "fill-red-500 text-red-500" : "text-red-500"}
            label="좋아요"
            onClick={onClickToggleFavorite}
            disabled={!userId || isFavoritePending || isEnded}
          />
          <IconTooltipButton
            icon={UserRoundPen}
            label="정보수정요청"
            onClick={openInfoEditRequestModal}
            disabled={!isAuthor || isEnded}
          />
          <span className="inline-flex h-10 items-center gap-1 px-2 text-xs font-medium text-gray-900">
            <Eye className="h-4 w-4" />
            {viewCount.toLocaleString()}
          </span>
        </div>
      </div>

      <InfoEditRequestModal
        open={isEditRequestModalOpen}
        texts={{
          ...STREAMER_INFO_EDIT_REQUEST_MODAL_TEXT,
          title: "콘텐츠 정보 수정 요청",
          description: "수정이 필요한 내용을 입력해 주세요. 관리자가 확인 후 반영합니다.",
        }}
        isSubmitting={isInfoEditSubmitting}
        onSubmit={handleSubmitInfoEditRequest}
        onClose={onCloseInfoEditModal}
      />

      <ReportRequestModal
        open={isReportModalOpen}
        texts={{
          ...ENTITY_REPORT_MODAL_TEXT,
          description: "콘텐츠 신고 사유를 작성해 주세요. (예: 허위 정보, 부적절한 콘텐츠 등)",
        }}
        isSubmitting={isReportSubmitting}
        onSubmit={handleSubmitReport}
        onClose={onCloseReportModal}
      />
    </>
  );
}
