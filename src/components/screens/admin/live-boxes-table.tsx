import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmAlert from "@/components/common/confirm-alert";
import IconTooltipButton from "@/components/common/icon-tooltip-button";
import { useDeleteLiveBox } from "@/hooks/mutations/admin/use-delete-live-box";
import { formatLiveBoxDate, formatLiveBoxDateTime } from "@/utils/admin-live-box";
import type { AdminLiveBoxesTableProps } from "@/types/admin-live-box-screen";

export default function LiveBoxesTable({
  boxes,
  isLoading,
  isError,
  onStartEdit,
}: AdminLiveBoxesTableProps) {
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const { mutate: removeLiveBox, isPending: isDeleting } = useDeleteLiveBox();

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full min-w-[980px] text-left whitespace-nowrap">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">관리</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">제목</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">카테고리</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">상태</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">참여자 수</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">생성자</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">생성일시</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">시작일시</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">종료일시</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(4)].map((_, index) => (
                <tr key={`live-box-skeleton-${index}`} className="border-b border-gray-100">
                  <td className="px-4 py-3" colSpan={10}>
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))
            ) : isError ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-sm text-gray-400">
                  박스 목록을 불러오지 못했습니다.
                </td>
              </tr>
            ) : boxes && boxes.length > 0 ? (
              boxes.map((box) => (
                <tr key={box.id} className="border-b border-gray-100 align-middle">
                  <td className="px-4 py-3 text-sm text-gray-600">
                    <div className="flex gap-1">
                      <IconTooltipButton
                        icon={Pencil}
                        label="수정"
                        onClick={() => onStartEdit(box.id)}
                        buttonClassName="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
                        iconClassName="h-3.5 w-3.5"
                      />
                      <IconTooltipButton
                        icon={Trash2}
                        label="삭제"
                        onClick={() => setDeleteTargetId(box.id)}
                        buttonClassName="h-7 w-7 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                        iconClassName="h-3.5 w-3.5"
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{box.id}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">{box.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{box.category.join(", ")}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{box.status}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {box.participant_streamer_ids.length.toLocaleString()}명
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{box.creator_profile?.nickname || "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatLiveBoxDateTime(box.created_at)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatLiveBoxDate(box.starts_at)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatLiveBoxDate(box.ends_at)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-gray-400 text-sm">
                  등록된 박스가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmAlert
        open={deleteTargetId !== null}
        title="박스 삭제"
        description="삭제하시겠습니까? 삭제 후에는 되돌릴 수 없습니다."
        confirmText="삭제"
        confirmVariant="danger"
        cancelText="취소"
        isPending={isDeleting}
        onConfirm={() => {
          if (deleteTargetId === null) return;
          removeLiveBox(deleteTargetId, {
            onSuccess: () => setDeleteTargetId(null),
          });
        }}
        onCancel={() => setDeleteTargetId(null)}
      />
    </>
  );
}
