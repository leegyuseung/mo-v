"use client";

import { useMemo, useState } from "react";
import { Clapperboard } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useContents } from "@/hooks/queries/admin/use-contents";
import { useUpdateContent } from "@/hooks/mutations/admin/use-update-content";
import type { ContentStatus, ContentWithAuthorProfile } from "@/types/content";
import ContentPendingRequestRow from "@/components/screens/admin/content-pending-request-row";
import ContentRequestDetailDialog from "@/components/screens/admin/content-request-detail-dialog";

export default function ContentPendingRequestsScreenClient() {
  const { data: contents, isLoading, isError } = useContents();
  const { mutate: updateContent, isPending: isUpdating } = useUpdateContent();
  const [detailContent, setDetailContent] = useState<ContentWithAuthorProfile | null>(null);

  const pendingContents = useMemo(() => {
    return (contents || []).filter((content) => content.status === "pending");
  }, [contents]);

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
    <div className="mx-auto max-w-7xl p-6 md:p-10">
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <Clapperboard className="h-5 w-5 text-indigo-500" />
          <h1 className="text-2xl font-bold text-gray-900">콘텐츠 등록 대기 요청</h1>
        </div>
        <p className="text-sm text-gray-500">대기 상태의 콘텐츠 등록 요청만 모아서 관리합니다.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full min-w-[1180px] whitespace-nowrap text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">요청자</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">제목</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">요청일시</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">처리</th>
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

      <ContentRequestDetailDialog
        content={detailContent}
        onOpenChange={(open) => {
          if (!open) setDetailContent(null);
        }}
      />
    </div>
  );
}
