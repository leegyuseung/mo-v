"use client";

import { useMemo, useState } from "react";
import { Clapperboard, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmAlert from "@/components/common/confirm-alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useContents } from "@/hooks/queries/admin/use-contents";
import { useUpdateContent } from "@/hooks/mutations/admin/use-update-content";
import type {
  ContentStatus,
  ContentUpdateInput,
  ContentWithAuthorProfile,
} from "@/types/content";
import ContentEditDialog from "@/components/screens/admin/content-edit-dialog";
import ContentPendingRequestRow from "@/components/screens/admin/content-pending-request-row";

function getStatusLabel(status: string) {
  if (status === "pending") return "대기중";
  if (status === "approved") return "승인";
  if (status === "ended") return "마감";
  if (status === "rejected") return "거절";
  if (status === "cancelled") return "취소";
  if (status === "deleted") return "삭제";
  return status;
}

function getStatusClassName(status: string) {
  if (status === "pending") return "border-gray-200 bg-gray-100 text-gray-600";
  if (status === "approved") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "ended") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "rejected") return "border-red-200 bg-red-50 text-red-700";
  if (status === "cancelled") return "border-gray-200 bg-gray-100 text-gray-600";
  if (status === "deleted") return "border-gray-300 bg-gray-100 text-gray-700";
  return "border-gray-200 bg-gray-100 text-gray-600";
}

function formatDateLabel(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ko-KR");
}

function formatDateRangeLabel(start: string | null, end: string | null) {
  return `${formatDateLabel(start)} ~ ${formatDateLabel(end)}`;
}

/** 관리자 콘텐츠 관리 화면 */
export default function ContentsScreenClient() {
  const { data: contents, isLoading, isError } = useContents();
  const { mutate: updateContent, isPending: isUpdating } = useUpdateContent();
  const [editingContent, setEditingContent] = useState<ContentWithAuthorProfile | null>(null);
  const [detailContent, setDetailContent] = useState<ContentWithAuthorProfile | null>(null);
  const [deleteTargetContent, setDeleteTargetContent] = useState<ContentWithAuthorProfile | null>(null);

  const registeredContents = useMemo(() => {
    return (contents || []).filter((content) => content.status === "approved");
  }, [contents]);

  const pendingContents = useMemo(() => {
    return (contents || []).filter((content) => content.status === "pending");
  }, [contents]);

  const handleUpdateContent = (contentId: number, payload: ContentUpdateInput) => {
    updateContent(
      {
        contentId,
        payload,
      },
      {
        onSuccess: () => {
          setEditingContent(null);
        },
      }
    );
  };

  const handleUpdateRequestStatus = (
    contentId: number,
    status: ContentStatus,
    reviewNote?: string
  ) => {
    updateContent({
      contentId,
      payload: {
        status,
        review_note: status === "rejected" ? reviewNote || null : null,
      },
    });
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Clapperboard className="w-5 h-5 text-indigo-500" />
          <h1 className="text-2xl font-bold text-gray-900">콘텐츠 관리</h1>
        </div>
        <p className="text-sm text-gray-500">등록된 콘텐츠와 콘텐츠 등록 요청을 함께 관리합니다.</p>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">등록된 콘텐츠</h2>
        <p className="text-sm text-gray-500">등록 완료된 콘텐츠 목록입니다. 항목별 수정이 가능합니다.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">제목</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">작성자</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">화면 주소</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">등록일시</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">관리</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(4)].map((_, index) => (
                <tr key={`admin-content-skeleton-${index}`} className="border-b border-gray-100">
                  <td className="px-4 py-3" colSpan={5}>
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">
                  콘텐츠 목록을 불러오지 못했습니다.
                </td>
              </tr>
            ) : registeredContents.length > 0 ? (
              registeredContents.map((content) => (
                <tr key={`admin-content-${content.id}`} className="border-b border-gray-100 align-middle">
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{content.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {content.author_profile?.nickname || content.created_by}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <a
                      href={`/contents/${content.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block max-w-[260px] truncate text-blue-500 underline underline-offset-2 hover:text-blue-600"
                      title={`/contents/${content.id}`}
                    >
                      {`/contents/${content.id}`}
                    </a>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(content.created_at).toLocaleString("ko-KR")}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingContent(content)}
                        className="cursor-pointer"
                      >
                        수정
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteTargetContent(content)}
                        className="cursor-pointer border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        삭제
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">
                  등록된 콘텐츠가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-10 mb-4">
        <h2 className="text-xl font-bold text-gray-900">콘텐츠 등록 요청 대기</h2>
        <p className="text-sm text-gray-500">대기 상태(pending) 요청만 표시됩니다.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full min-w-[1180px] text-left whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">요청자</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">제목</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">요청일시</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">처리</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(4)].map((_, index) => (
                <tr key={`admin-content-request-skeleton-${index}`} className="border-b border-gray-100">
                  <td className="px-4 py-3" colSpan={4}>
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-sm text-gray-400">
                  콘텐츠 등록 요청 목록을 불러오지 못했습니다.
                </td>
              </tr>
            ) : pendingContents.length > 0 ? (
              pendingContents.map((request) => (
                <ContentPendingRequestRow
                  key={`admin-content-pending-${request.id}`}
                  request={request}
                  isPendingAction={isUpdating}
                  onApprove={(contentId) => handleUpdateRequestStatus(contentId, "approved")}
                  onReject={(contentId, reviewNote) =>
                    handleUpdateRequestStatus(contentId, "rejected", reviewNote)
                  }
                  onViewDetail={setDetailContent}
                />
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-sm text-gray-400">
                  대기 중인 콘텐츠 등록 요청이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {editingContent ? (
        <ContentEditDialog
          key={`content-edit-${editingContent.id}`}
          open
          content={editingContent}
          isPending={isUpdating}
          onOpenChange={(open) => {
            if (!open) setEditingContent(null);
          }}
          onSubmit={handleUpdateContent}
        />
      ) : null}

      <ConfirmAlert
        open={deleteTargetContent !== null}
        title="콘텐츠 삭제"
        description="삭제하시겠습니까? 확인 시 상태가 deleted로 변경됩니다."
        confirmText="삭제"
        cancelText="취소"
        isPending={isUpdating}
        onConfirm={() => {
          if (!deleteTargetContent) return;
          updateContent(
            {
              contentId: deleteTargetContent.id,
              payload: {
                status: "deleted",
                review_note: null,
              },
            },
            {
              onSuccess: () => {
                setDeleteTargetContent(null);
              },
            }
          );
        }}
        onCancel={() => setDeleteTargetContent(null)}
      />

      <Dialog open={detailContent !== null} onOpenChange={(open) => !open && setDetailContent(null)}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>콘텐츠 요청 상세</DialogTitle>
            <DialogDescription>/write 화면 입력 항목 전체를 확인할 수 있습니다.</DialogDescription>
          </DialogHeader>

          {detailContent ? (
            <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1 text-sm text-gray-700">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-[320px_minmax(0,1fr)]">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500">포스터 이미지</p>
                  <div className="relative h-56 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                    {detailContent.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={detailContent.image_url}
                        alt={`${detailContent.title} 포스터`}
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
                    <p className="mt-1 font-medium text-gray-900">{detailContent.title}</p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500">신청링크</p>
                    <a
                      href={detailContent.application_url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block break-all text-blue-500 underline underline-offset-2 hover:text-blue-600"
                    >
                      {detailContent.application_url}
                    </a>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold text-gray-500">상태</p>
                      <span
                        className={`mt-1 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusClassName(
                          detailContent.status
                        )}`}
                      >
                        {getStatusLabel(detailContent.status)}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-500">요청자</p>
                      <p className="mt-1">{detailContent.author_profile?.nickname || detailContent.created_by}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500">콘텐츠 종류</p>
                <p className="mt-1">
                  {detailContent.content_type.length > 0 ? detailContent.content_type.join(", ") : "-"}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-gray-500">참가자 구성</p>
                  <p className="mt-1">{detailContent.participant_composition}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">주최자</p>
                  <p className="mt-1">{detailContent.host_name || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">주최단체</p>
                  <p className="mt-1">{detailContent.host_organization || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">상금(상품)</p>
                  <p className="mt-1">{detailContent.reward || "-"}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-gray-500">콘텐츠 모집 일정</p>
                  <p className="mt-1">
                    {formatDateRangeLabel(detailContent.recruitment_start_at, detailContent.recruitment_end_at)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">콘텐츠 일정</p>
                  <p className="mt-1">
                    {formatDateRangeLabel(detailContent.content_start_at, detailContent.content_end_at)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">최소모집인원</p>
                  <p className="mt-1">{detailContent.min_participants ?? "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">최대모집인원</p>
                  <p className="mt-1">{detailContent.max_participants ?? "-"}</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500">참가조건</p>
                <p className="mt-1 whitespace-pre-wrap">{detailContent.participation_requirement || "-"}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500">콘텐츠 설명</p>
                <p className="mt-1 whitespace-pre-wrap">{detailContent.description || "-"}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500">거절 사유</p>
                <p className="mt-1 whitespace-pre-wrap">{detailContent.review_note || "-"}</p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500">이메일</p>
                  <p className="mt-1 break-all">{detailContent.contact_email || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">디스코드</p>
                  <p className="mt-1">{detailContent.contact_discord || "-"}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500">기타 연락처</p>
                  <p className="mt-1 break-all">{detailContent.contact_other || "-"}</p>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
