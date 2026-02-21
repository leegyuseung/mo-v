"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowBigLeft, Siren, Star, UserRound, UserRoundPen, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useIdolGroupDetail } from "@/hooks/queries/groups/use-idol-group-detail";
import { useCreateGroupInfoEditRequest } from "@/hooks/mutations/groups/use-create-group-info-edit-request";
import { useToggleStar } from "@/hooks/mutations/star/use-toggle-star";
import { useAuthStore } from "@/store/useAuthStore";
import {
  ENTITY_REPORT_MODAL_TEXT,
  GROUP_INFO_EDIT_REQUEST_MODAL_TEXT,
} from "@/lib/constant";
import { isSupabaseStorageUrl } from "@/utils/image";
import InfoEditRequestModal from "@/components/common/info-edit-request-modal";
import { fetchStarCount } from "@/api/star";
import StarCountBadge from "@/components/common/star-count-badge";
import ReportRequestModal from "@/components/common/report-request-modal";
import { useCreateEntityReportRequest } from "@/hooks/mutations/reports/use-create-entity-report-request";

type GroupDetailScreenProps = {
  groupCode: string;
};

export default function GroupDetailScreen({ groupCode }: GroupDetailScreenProps) {
  const [isEditRequestModalOpen, setIsEditRequestModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const { user, profile } = useAuthStore();
  const { data: group, isLoading } = useIdolGroupDetail(groupCode);
  const { starred: isStarred, isToggling: isStarToggling, toggle: onClickStar } = useToggleStar("group", group?.id);
  const { data: groupStarCount = 0, isLoading: isGroupStarCountLoading } = useQuery({
    queryKey: ["group-star-count", group?.id],
    queryFn: () => fetchStarCount(group!.id, "group"),
    enabled: Boolean(group?.id),
  });
  const {
    mutateAsync: createInfoEditRequest,
    isPending: isInfoEditRequestSubmitting,
  } = useCreateGroupInfoEditRequest();
  const {
    mutateAsync: createReportRequest,
    isPending: isReportSubmitting,
  } = useCreateEntityReportRequest();

  const openInfoEditRequestModal = () => {
    if (!user) {
      toast.error("로그인 후 정보 수정 요청이 가능합니다.");
      return;
    }
    setIsEditRequestModalOpen(true);
  };

  const handleSubmitInfoEditRequest = async (content: string) => {
    if (!user || !group) {
      toast.error("로그인 후 정보 수정 요청이 가능합니다.");
      return;
    }
    if (!group.members_detail || group.members_detail.length === 0) {
      toast.error("연결된 멤버가 없어 요청을 접수할 수 없습니다.");
      return;
    }

    try {
      await createInfoEditRequest({
        content,
        streamerId: group.members_detail[0].id,
        groupName: group.name,
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

  const openReportModal = () => {
    if (!user) {
      toast.error("로그인 후 신고가 가능합니다.");
      return;
    }
    setIsReportModalOpen(true);
  };

  const handleSubmitReport = async (content: string) => {
    if (!user || !group) {
      toast.error("로그인 후 신고가 가능합니다.");
      return;
    }

    try {
      await createReportRequest({
        targetType: "group",
        targetCode: group.group_code,
        targetName: group.name || "그룹",
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

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="p-6 text-center text-gray-400">그룹 정보가 없습니다.</div>
    );
  }

  const infoRows: Array<{ label: string; value: string }> = [
    { label: "리더", value: group.leader || "-" },
    { label: "팬덤명", value: group.fandom_name || "-" },
    { label: "소속", value: group.agency || "-" },
    { label: "결성일", value: group.formed_at || "-" },
    { label: "데뷔일", value: group.debut_at || "-" },
  ];


  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <div className="group relative">
          <Link href="/group">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="cursor-pointer h-10 w-10"
            >
              <ArrowBigLeft className="w-5 h-5" />
            </Button>
          </Link>
          <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
            뒤로가기
          </span>
        </div>

        <div className="flex items-center gap-1">
          <div className="group relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="cursor-pointer h-10 w-10"
              onClick={openReportModal}
              disabled={!user}
            >
              <Siren className="w-5 h-5 text-red-500" />
            </Button>
            <span className="pointer-events-none absolute right-1/2 top-full z-20 mt-1 translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
              신고하기
            </span>
          </div>

          <div className="group relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="cursor-pointer h-10 w-10"
              onClick={onClickStar}
              disabled={isStarToggling}
            >
              <Star
                className={`w-5 h-5 ${isStarred ? "fill-yellow-400 text-yellow-400" : "text-yellow-500"
                  }`}
              />
            </Button>
            <span className="pointer-events-none absolute right-1/2 top-full z-20 mt-1 translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
              즐겨찾기
            </span>
          </div>

          <div className="group relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="cursor-pointer h-10 w-10"
              onClick={openInfoEditRequestModal}
              disabled={!user}
            >
              <UserRoundPen className="w-5 h-5" />
            </Button>
            <span className="pointer-events-none absolute right-1/2 top-full z-20 mt-1 translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
              정보수정요청
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white p-5 md:p-7 shadow-sm space-y-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="mx-auto md:mx-0 flex shrink-0 flex-col items-center gap-3">
            <div
              className={`relative h-40 w-40 overflow-hidden rounded-full border ${group.bg_color ? "border-rose-200 bg-rose-900/80" : "border-gray-200 bg-white"
                }`}
            >
              {group.image_url ? (
                <Image
                  src={group.image_url}
                  alt={group.name}
                  fill
                  className="object-contain"
                  sizes="160px"
                  unoptimized={isSupabaseStorageUrl(group.image_url)}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center">
                  <UsersRound className="w-10 h-10 text-gray-300" />
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {group.fancafe_url ? (
                <a
                  href={group.fancafe_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white hover:border-green-300 hover:bg-green-50"
                  aria-label="카페 이동"
                >
                  <Image src="/icons/cafe.svg" alt="cafe" width={18} height={18} />
                </a>
              ) : null}
              {group.youtube_url ? (
                <a
                  href={group.youtube_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white hover:border-red-300 hover:bg-red-50"
                  aria-label="유튜브 이동"
                >
                  <Image src="/icons/youtube.svg" alt="youtube" width={18} height={18} />
                </a>
              ) : null}
            </div>
            <StarCountBadge count={groupStarCount} isLoading={isGroupStarCountLoading} />
          </div>

          <div className="flex-1 min-w-0 space-y-6">
            <div className="mt-1">
              <p className="text-3xl font-bold text-gray-900 break-all">{group.name || "-"}</p>
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
              {group.members_detail.map((member) => (
                <Link
                  key={member.id}
                  href={`/vlist/${member.public_id || member.id}`}
                  className="group/member relative"
                  title={member.nickname || "버츄얼"}
                >
                  <div className="relative h-10 w-10 overflow-hidden rounded-full border border-gray-200 bg-white">
                    {member.image_url ? (
                      <Image
                        src={member.image_url}
                        alt={member.nickname || "streamer"}
                        fill
                        sizes="40px"
                        className="object-contain"
                        unoptimized={isSupabaseStorageUrl(member.image_url)}
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
            "그룹 신고 사유를 작성해 주세요. (예: 물의, 장기 미활동, 잘못된 정보 등)",
        }}
        isSubmitting={isReportSubmitting}
        onSubmit={handleSubmitReport}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}
