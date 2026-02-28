import { Loader, Pause, X } from "lucide-react";
import ContentsEarlyEndButton from "@/components/screens/contents/contents-early-end-button";
import ContentsDetailScheduleHoverCard from "@/components/screens/contents/contents-detail-schedule-hover-card";
import type { ContentStatus } from "@/types/content";
import type { ContentsDetailSummarySectionProps } from "@/types/contents-detail";
import {
  getRecruitmentDdayLabel,
  getRecruitmentStatusLabel,
  getStatusClassName,
} from "@/components/screens/contents/contents-screen-utils";

function getStatusIcon(status: ContentStatus, isRecruiting: boolean) {
  if (status === "pending") return <Pause className="h-3.5 w-3.5" />;
  if (status === "approved") return <Loader className={`h-3.5 w-3.5 ${isRecruiting ? "animate-spin" : ""}`} />;
  if (status === "ended") return <X className="h-3.5 w-3.5" />;
  return null;
}

export default function ContentsDetailSummarySection({
  title,
  status,
  nowTimestamp,
  participantComposition,
  recruitmentStartAt,
  recruitmentEndAt,
  contentStartAt,
  contentEndAt,
  applicationUrl,
  contentId,
  authorId,
  contentTypes,
  isNew,
  isClosingSoon,
}: ContentsDetailSummarySectionProps) {
  const isEnded = status === "ended";
  const isApproved = status === "approved";
  const statusLabel = getRecruitmentStatusLabel(status, recruitmentStartAt, nowTimestamp);
  const isWaitingRecruitment = statusLabel === "모집대기중";
  const isRecruiting = isApproved && !isWaitingRecruitment;
  const ddayLabel = isRecruiting ? getRecruitmentDdayLabel(recruitmentEndAt, nowTimestamp) : null;
  const visibleContentTypes = contentTypes.slice(0, 10);
  const hiddenContentTypeCount = Math.max(0, contentTypes.length - 10);

  return (
    <div className="min-w-0 self-stretch md:h-[530px]">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {isNew ? (
          <span className="rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
            NEW
          </span>
        ) : null}
        {isClosingSoon ? (
          <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-xs font-medium text-rose-700">
            마감임박
          </span>
        ) : null}
        <span className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700">
          {participantComposition}
        </span>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
            isWaitingRecruitment
              ? "border-gray-200 bg-gray-100 text-gray-600"
              : getStatusClassName(status)
          }`}
        >
          {getStatusIcon(status, isRecruiting)}
          {statusLabel}
          {ddayLabel ? (
            <span className="ml-0.5 text-xs font-bold text-green-700">{ddayLabel}</span>
          ) : null}
        </span>
      </div>

      <h1 className="text-xl font-bold text-gray-900 md:text-2xl">{title}</h1>

      <div className="mt-3 grid grid-cols-1 gap-2">
        <ContentsDetailScheduleHoverCard
          label="모집일정"
          start={recruitmentStartAt}
          end={recruitmentEndAt}
          tone="blue"
        />
        <ContentsDetailScheduleHoverCard
          label="콘텐츠일정"
          start={contentStartAt}
          end={contentEndAt}
          tone="green"
        />
      </div>

      <div className="mt-6">
        {isEnded ? (
          <button
            type="button"
            disabled
            className="inline-flex h-9 w-full cursor-not-allowed items-center justify-center rounded-md bg-gray-300 px-4 text-sm font-medium text-gray-500"
          >
            신청하기
          </button>
        ) : (
          <a
            href={applicationUrl}
            target="_blank"
            rel="noreferrer"
            className="cursor-pointer inline-flex h-9 w-full items-center justify-center rounded-md bg-gray-900 px-4 text-sm font-medium text-white hover:bg-black"
          >
            신청하기
          </a>
        )}
      </div>

      <ContentsEarlyEndButton contentId={contentId} authorId={authorId} status={status} />

      <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
        <p className="mb-2 text-xs font-medium text-gray-500">콘텐츠 종류</p>
        <div className="flex flex-wrap gap-1.5">
          {contentTypes.length > 0 ? (
            <>
              {visibleContentTypes.map((type) => (
                <span
                  key={`detail-content-type-${type}`}
                  className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-700"
                >
                  {type}
                </span>
              ))}
              {hiddenContentTypeCount > 0 ? (
                <span className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600">
                  +{hiddenContentTypeCount}
                </span>
              ) : null}
            </>
          ) : (
            <span className="rounded-md border border-gray-200 bg-white px-2.5 py-1 text-xs text-gray-500">
              콘텐츠 종류 미지정
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
