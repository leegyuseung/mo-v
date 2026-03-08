"use client";

import { Boxes } from "lucide-react";
import LiveBoxPendingRequestsTable from "@/components/screens/admin/live-box-pending-requests-table";
import { usePendingLiveBoxRequests } from "@/hooks/queries/admin/use-pending-live-box-requests";

export default function LiveBoxPendingRequestsScreenClient() {
  const {
    data: pendingLiveBoxRequests,
    isLoading,
    isError,
  } = usePendingLiveBoxRequests();

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-10">
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <Boxes className="h-5 w-5 text-cyan-600" />
          <h1 className="text-2xl font-bold text-gray-900">박스 등록 대기 요청</h1>
        </div>
        <p className="text-sm text-gray-500">대기 상태의 박스 등록 요청만 모아서 관리합니다.</p>
      </div>

      <LiveBoxPendingRequestsTable
        pendingLiveBoxRequests={pendingLiveBoxRequests}
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  );
}
