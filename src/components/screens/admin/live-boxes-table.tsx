import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatLiveBoxDate, formatLiveBoxDateTime } from "@/utils/admin-live-box";
import type { AdminLiveBoxesTableProps } from "@/types/admin-live-box-screen";

export default function LiveBoxesTable({
  boxes,
  isLoading,
  isError,
  onStartEdit,
}: AdminLiveBoxesTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
      <table className="w-full min-w-[980px] text-left whitespace-nowrap">
        <thead>
          <tr className="bg-gray-50/80 border-b border-gray-100">
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">제목</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">카테고리</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">상태</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">참여자 수</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">생성자</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">생성일시</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">시작일시</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">종료일시</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">수정</th>
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
                <td className="px-4 py-3 text-sm text-gray-600">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onStartEdit(box.id)}
                    className="cursor-pointer"
                  >
                    수정
                  </Button>
                </td>
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
  );
}
