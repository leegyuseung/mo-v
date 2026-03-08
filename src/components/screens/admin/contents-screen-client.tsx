"use client";

import { useMemo, useState } from "react";
import { Clapperboard, Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmAlert from "@/components/common/confirm-alert";
import IconTooltipButton from "@/components/common/icon-tooltip-button";
import { useContents } from "@/hooks/queries/admin/use-contents";
import { useUpdateContent } from "@/hooks/mutations/admin/use-update-content";
import type {
  ContentStatus,
  ContentUpdateInput,
  ContentWithAuthorProfile,
} from "@/types/content";
import ContentEditDialog from "@/components/screens/admin/content-edit-dialog";
import {
  formatDateLabel,
  getStatusClassName,
  getStatusLabel,
} from "@/components/screens/admin/admin-contents-utils";

const REGISTERED_CONTENT_STATUS_FILTERS: Array<{ value: "all" | ContentStatus; label: string }> = [
  { value: "all", label: "전체" },
  { value: "approved", label: "등록(진행중)" },
  { value: "ended", label: "마감" },
  { value: "rejected", label: "거절" },
  { value: "cancelled", label: "취소" },
  { value: "deleted", label: "삭제" },
];

/** 관리자 콘텐츠 관리 화면 */
export default function ContentsScreenClient() {
  const { data: contents, isLoading, isError } = useContents();
  const { mutate: updateContent, isPending: isUpdating } = useUpdateContent();
  const [editingContent, setEditingContent] = useState<ContentWithAuthorProfile | null>(null);
  const [deleteTargetContent, setDeleteTargetContent] = useState<ContentWithAuthorProfile | null>(null);
  const [registeredStatusFilter, setRegisteredStatusFilter] = useState<"all" | ContentStatus>("approved");

  const registeredContents = useMemo(() => {
    const list = (contents || []).filter((content) => content.status !== "pending");
    if (registeredStatusFilter === "all") return list;
    return list.filter((content) => content.status === registeredStatusFilter);
  }, [contents, registeredStatusFilter]);

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

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Clapperboard className="w-5 h-5 text-indigo-500" />
          <h1 className="text-2xl font-bold text-gray-900">콘텐츠 관리</h1>
        </div>
        <p className="text-sm text-gray-500">등록된 콘텐츠를 조회하고 수정 또는 삭제할 수 있습니다.</p>
      </div>

      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">등록된 콘텐츠</h2>
          <p className="text-sm text-gray-500">상태 필터로 콘텐츠를 나눠서 볼 수 있습니다.</p>
        </div>
        <div className="inline-flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500">상태 필터</span>
          <select
            value={registeredStatusFilter}
            onChange={(event) =>
              setRegisteredStatusFilter(event.target.value as "all" | ContentStatus)
            }
            className="h-9 min-w-[150px] rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-700"
          >
            {REGISTERED_CONTENT_STATUS_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full min-w-[980px] text-left whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">관리</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">제목</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">상태</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">모집 시작</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">모집 마감</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">작성자</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">등록일시</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(4)].map((_, index) => (
                <tr key={`admin-content-skeleton-${index}`} className="border-b border-gray-100">
                  <td className="px-4 py-3" colSpan={7}>
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                  콘텐츠 목록을 불러오지 못했습니다.
                </td>
              </tr>
            ) : registeredContents.length > 0 ? (
              registeredContents.map((content) => (
                <tr key={`admin-content-${content.id}`} className="border-b border-gray-100 align-middle">
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex gap-1">
                      <IconTooltipButton
                        icon={Pencil}
                        label="수정"
                        onClick={() => setEditingContent(content)}
                        buttonClassName="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
                        iconClassName="h-3.5 w-3.5"
                      />
                      <IconTooltipButton
                        icon={Trash2}
                        label="삭제"
                        onClick={() => setDeleteTargetContent(content)}
                        buttonClassName="h-7 w-7 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                        iconClassName="h-3.5 w-3.5"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{content.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusClassName(
                        content.status
                      )}`}
                    >
                      {getStatusLabel(content.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDateLabel(content.recruitment_start_at)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDateLabel(content.recruitment_end_at)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {content.author_profile?.nickname || content.created_by}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(content.created_at).toLocaleString("ko-KR")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">
                  등록된 콘텐츠가 없습니다.
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
    </div>
  );
}
