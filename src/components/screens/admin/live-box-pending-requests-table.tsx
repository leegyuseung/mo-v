import { Skeleton } from "@/components/ui/skeleton";
import LiveBoxPendingRequestRow from "@/components/screens/admin/live-box-pending-request-row";
import type { AdminLiveBoxPendingRequestsTableProps } from "@/types/admin-live-box-screen";

export default function LiveBoxPendingRequestsTable({
  pendingLiveBoxRequests,
  isLoading,
  isError,
}: AdminLiveBoxPendingRequestsTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
      <table className="w-full min-w-[1220px] text-left whitespace-nowrap">
        <thead>
          <tr className="bg-gray-50/80 border-b border-gray-100">
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">요청자</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-[380px]">주제</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">관련 사이트</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">요청일시</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">처리</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            [...Array(4)].map((_, index) => (
              <tr key={`pending-live-box-request-skeleton-${index}`} className="border-b border-gray-100">
                <td className="px-4 py-3" colSpan={6}>
                  <Skeleton className="h-5 w-full" />
                </td>
              </tr>
            ))
          ) : isError ? (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-sm text-gray-400">
                박스 등록 요청 목록을 불러오지 못했습니다.
              </td>
            </tr>
          ) : pendingLiveBoxRequests && pendingLiveBoxRequests.length > 0 ? (
            pendingLiveBoxRequests.map((request) => (
              <LiveBoxPendingRequestRow key={`pending-live-box-request-${request.id}`} request={request} />
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">
                대기 중인 박스 등록 요청이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
