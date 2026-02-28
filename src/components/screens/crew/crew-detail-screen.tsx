"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowBigLeft,
  Siren,
  Star,
  UserRound,
  UserRoundPen,
  UsersRound,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useCrewDetail } from "@/hooks/queries/crews/use-crew-detail";
import { useCreateCrewInfoEditRequest } from "@/hooks/mutations/crews/use-create-crew-info-edit-request";
import { useToggleStar } from "@/hooks/mutations/star/use-toggle-star";
import { useAuthStore } from "@/store/useAuthStore";
import {
  ENTITY_REPORT_MODAL_TEXT,
  GROUP_INFO_EDIT_REQUEST_MODAL_TEXT,
} from "@/lib/constant";
import { isSupabaseStorageUrl } from "@/utils/image";
import InfoEditRequestModal from "@/components/common/info-edit-request-modal";
import IconTooltipButton from "@/components/common/icon-tooltip-button";
import { useStarCount } from "@/hooks/queries/star/use-star-count";
import StarCountBadge from "@/components/common/star-count-badge";
import ReportRequestModal from "@/components/common/report-request-modal";
import { useCreateEntityReportRequest } from "@/hooks/mutations/reports/use-create-entity-report-request";
import type { CrewDetailScreenProps } from "@/types/crew";

export default function CrewDetailScreen({ crewCode }: CrewDetailScreenProps) {
  const [isEditRequestModalOpen, setIsEditRequestModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { user, profile } = useAuthStore();
  const { data: crew, isLoading } = useCrewDetail(crewCode);
  const { starred: isStarred, isToggling: isStarToggling, toggle: onClickStar } = useToggleStar("crew", crew?.id);
  const { data: crewStarCount = 0, isLoading: isCrewStarCountLoading } = useStarCount(
    crew?.id,
    "crew"
  );
  const {
    mutateAsync: createInfoEditRequest,
    isPending: isInfoEditRequestSubmitting,
  } = useCreateCrewInfoEditRequest();
  const {
    mutateAsync: createReportRequest,
    isPending: isReportSubmitting,
  } = useCreateEntityReportRequest();

  /** 정보수정 요청 모달을 연다 (로그인 필수) */
  const openInfoEditRequestModal = () => {
    if (!user) {
      toast.error("로그인 후 정보 수정 요청이 가능합니다.");
      return;
    }
    setIsEditRequestModalOpen(true);
  };

  /** 정보수정 요청 제출 핸들러 */
  const handleSubmitInfoEditRequest = async (content: string) => {
    if (!user || !crew) {
      toast.error("로그인 후 정보 수정 요청이 가능합니다.");
      return;
    }

    try {
      await createInfoEditRequest({
        content,
        crewId: crew.id,
        crewCode: crew.crew_code,
        crewName: crew.name,
        requesterId: user.id,
        requesterNickname: profile?.nickname || null,
      });
      toast.success(GROUP_INFO_EDIT_REQUEST_MODAL_TEXT.submitSuccess);
      setIsEditRequestModalOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "정보 수정 요청 접수에 실패했습니다.";
      toast.error(message);
    }
  };

  /** 신고 모달을 연다 (로그인 필수) */
  const openReportModal = () => {
    if (!user) {
      toast.error("로그인 후 신고가 가능합니다.");
      return;
    }
    setIsReportModalOpen(true);
  };

  /** 신고 제출 핸들러 */
  const handleSubmitReport = async (content: string) => {
    if (!user || !crew) {
      toast.error("로그인 후 신고가 가능합니다.");
      return;
    }

    try {
      await createReportRequest({
        targetType: "crew",
        targetCode: crew.crew_code,
        targetName: crew.name || "소속",
        reporterId: user.id,
        reporterNickname: profile?.nickname || null,
        content,
      });
      toast.success(ENTITY_REPORT_MODAL_TEXT.submitSuccess);
      setIsReportModalOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "신고 접수에 실패했습니다.";
      toast.error(message);
    }
  };

  /* ─── 로딩 / 빈 상태 ─── */
  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!crew) {
    return <div className="p-6 text-center text-gray-400">소속 정보가 없습니다.</div>;
  }

  /** 소속 기본 정보 행 */
  const infoRows: Array<{ label: string; value: string }> = [
    { label: "리더", value: crew.leader || "-" },
    { label: "기타 멤버", value: crew.member_etc?.join(", ") || "-" },
    { label: "팬덤명", value: crew.fandom_name || "-" },
    { label: "데뷔일", value: crew.debut_at || "-" },
  ];


  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* ─── 상단 액션 버튼 (뒤로가기 · 신고 · 즐겨찾기 · 정보수정) ─── */}
      <div className="mb-4 flex items-center justify-between">
        <IconTooltipButton
          icon={ArrowBigLeft}
          label="뒤로가기"
          tooltipAlign="left"
          onClick={() => window.history.back()}
        />

        <div className="flex items-center gap-1">
          <IconTooltipButton
            icon={Siren}
            iconClassName="text-red-500"
            label="신고하기"
            onClick={openReportModal}
            disabled={!user}
          />
          <IconTooltipButton
            icon={Star}
            iconClassName={isStarred ? "fill-yellow-400 text-yellow-400" : "text-yellow-500"}
            label="즐겨찾기"
            onClick={onClickStar}
            disabled={isStarToggling}
          />
          <IconTooltipButton
            icon={UserRoundPen}
            label="정보수정요청"
            onClick={openInfoEditRequestModal}
            disabled={!user}
          />
        </div>
      </div>

      {/* ─── 소속 상세 카드 ─── */}
      <div className="rounded-3xl border border-gray-200 bg-white p-5 md:p-7 shadow-sm space-y-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          {/* ── 대표 이미지 + 외부 링크 ── */}
          <div className="mx-auto md:mx-0 flex shrink-0 flex-col items-center gap-3">
            <div
              className={`relative h-40 w-40 overflow-hidden rounded-full border ${crew.bg_color ? "border-black-200 bg-black/80" : "border-gray-200 bg-white"
                }`}
            >
              {crew.image_url ? (
                <Image
                  src={crew.image_url}
                  alt={crew.name}
                  fill
                  priority
                  loading="eager"
                  className="object-contain"
                  sizes="160px"
                  unoptimized={isSupabaseStorageUrl(crew.image_url)}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <UsersRound className="w-10 h-10 text-gray-300" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {crew.fancafe_url ? (
                <a
                  href={crew.fancafe_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white hover:border-green-300 hover:bg-green-50"
                  aria-label="카페 이동"
                >
                  <img src="/icons/cafe.svg" alt="cafe" width={18} height={18} />
                </a>
              ) : null}
              {crew.youtube_url ? (
                <a
                  href={crew.youtube_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white hover:border-red-300 hover:bg-red-50"
                  aria-label="유튜브 이동"
                >
                  <img src="/icons/youtube.svg" alt="youtube" width={18} height={18} />
                </a>
              ) : null}
              {crew.chzzk_url ? (
                <a
                  href={crew.chzzk_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white hover:border-green-300 hover:bg-green-50"
                  aria-label="치지직 이동"
                >
                  <img src="/icons/chzzk.svg" alt="chzzk" width={18} height={18} />
                </a>
              ) : null}
              {crew.soop_url ? (
                <a
                  href={crew.soop_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50"
                  aria-label="soop 이동"
                >
                  <img src="/icons/soop.svg" alt="soop" width={18} height={18} />
                </a>
              ) : null}
            </div>
            <StarCountBadge count={crewStarCount} isLoading={isCrewStarCountLoading} />
          </div>

          {/* ── 소속 정보 + 멤버 아바타 ── */}
          <div className="flex-1 min-w-0 space-y-6">
            <div className="mt-1">
              <p className="text-3xl font-bold text-gray-900 break-all">{crew.name || "-"}</p>
            </div>

            <div className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-2">
              {infoRows.map((row) => (
                <div key={row.label} className="flex items-center gap-2 text-sm">
                  <span className="w-20 shrink-0 text-gray-500">{row.label}</span>
                  <span className="font-medium text-gray-800 break-all">{row.value}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8">
              {crew.members_detail.map((member) => (
                <Link
                  key={member.id}
                  href={`/vlist/${member.public_id || member.id}`}
                  className="group/member relative"
                  title={member.nickname || "버츄얼"}
                >
                  <div className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-200 bg-white">
                    {member.image_url ? (
                      <img
                        src={member.image_url}
                        alt={member.nickname || "streamer"}
                        loading="lazy"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <UserRound className="h-5 w-5 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-sm transition-opacity group-hover/member:opacity-100">
                    {member.nickname || "이름 미등록"}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── 모달 ─── */}
      <InfoEditRequestModal
        open={isEditRequestModalOpen}
        texts={GROUP_INFO_EDIT_REQUEST_MODAL_TEXT}
        isSubmitting={isInfoEditRequestSubmitting}
        onSubmit={handleSubmitInfoEditRequest}
        onClose={() => setIsEditRequestModalOpen(false)}
      />
      <ReportRequestModal
        open={isReportModalOpen}
        texts={{
          ...ENTITY_REPORT_MODAL_TEXT,
          description:
            "소속 신고 사유를 작성해 주세요. (예: 물의, 장기 미활동, 잘못된 정보 등)",
        }}
        isSubmitting={isReportSubmitting}
        onSubmit={handleSubmitReport}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}
