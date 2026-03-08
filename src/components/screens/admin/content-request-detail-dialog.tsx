"use client";

import { Image as ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ContentWithAuthorProfile } from "@/types/content";
import {
  formatDateRangeLabel,
  getStatusClassName,
  getStatusLabel,
} from "@/components/screens/admin/admin-contents-utils";

type ContentRequestDetailDialogProps = {
  content: ContentWithAuthorProfile | null;
  onOpenChange: (open: boolean) => void;
};

export default function ContentRequestDetailDialog({
  content,
  onOpenChange,
}: ContentRequestDetailDialogProps) {
  return (
    <Dialog open={content !== null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>콘텐츠 요청 상세</DialogTitle>
          <DialogDescription>/write 화면 입력 항목 전체를 확인할 수 있습니다.</DialogDescription>
        </DialogHeader>

        {content ? (
          <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1 text-sm text-gray-700">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-[320px_minmax(0,1fr)]">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500">포스터 이미지</p>
                <div className="relative h-56 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                  {content.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={content.image_url}
                      alt={`${content.title} 포스터`}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-400">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500">제목</p>
                  <p className="mt-1 font-medium text-gray-900">{content.title}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-500">신청링크</p>
                  <a
                    href={content.application_url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-block break-all text-blue-500 underline underline-offset-2 hover:text-blue-600"
                  >
                    {content.application_url}
                  </a>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-500">상태</p>
                    <span
                      className={`mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusClassName(
                        content.status
                      )}`}
                    >
                      {getStatusLabel(content.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500">요청자</p>
                    <p className="mt-1">{content.author_profile?.nickname || content.created_by}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500">콘텐츠 종류</p>
              <p className="mt-1">
                {content.content_type.length > 0 ? content.content_type.join(", ") : "-"}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-gray-500">참가자 구성</p>
                <p className="mt-1">{content.participant_composition}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">주최자</p>
                <p className="mt-1">{content.host_name || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">주최단체</p>
                <p className="mt-1">{content.host_organization || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">상금(상품)</p>
                <p className="mt-1">{content.reward || "-"}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold text-gray-500">콘텐츠 모집 일정</p>
                <p className="mt-1">
                  {formatDateRangeLabel(content.recruitment_start_at, content.recruitment_end_at)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">콘텐츠 일정</p>
                <p className="mt-1">
                  {formatDateRangeLabel(content.content_start_at, content.content_end_at)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">최소모집인원</p>
                <p className="mt-1">{content.min_participants ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">최대모집인원</p>
                <p className="mt-1">{content.max_participants ?? "-"}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500">참가조건</p>
              <p className="mt-1 whitespace-pre-wrap">{content.participation_requirement || "-"}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500">콘텐츠 설명</p>
              <p className="mt-1 whitespace-pre-wrap">{content.description || "-"}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500">거절 사유</p>
              <p className="mt-1 whitespace-pre-wrap">{content.review_note || "-"}</p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <p className="text-xs font-semibold text-gray-500">이메일</p>
                <p className="mt-1 break-all">{content.contact_email || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">디스코드</p>
                <p className="mt-1">{content.contact_discord || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500">기타 연락처</p>
                <p className="mt-1 break-all">{content.contact_other || "-"}</p>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
