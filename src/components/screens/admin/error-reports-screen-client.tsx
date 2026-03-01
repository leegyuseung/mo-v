"use client";

import { useState } from "react";
import { Bug } from "lucide-react";
import ConfirmAlert from "@/components/common/confirm-alert";
import AdminRequestActionButtons from "@/components/common/admin-request-action-buttons";
import { Skeleton } from "@/components/ui/skeleton";
import { ADMIN_ERROR_REPORT_REWARD_POINT } from "@/lib/constant";
import { useResolveErrorReportRequest } from "@/hooks/mutations/admin/use-resolve-error-report-request";
import { usePendingErrorReports } from "@/hooks/queries/admin/use-pending-error-reports";
import type { ErrorReportAdminItem } from "@/types/error-report";

export default function ErrorReportsScreenClient() {
  const { data: requests, isLoading } = usePendingErrorReports();
  const { mutate: resolveRequest, isPending } = useResolveErrorReportRequest();
  const [selectedRequest, setSelectedRequest] = useState<ErrorReportAdminItem | null>(null);
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);

  const openConfirm = (request: ErrorReportAdminItem, action: "approve" | "reject") => {
    setSelectedRequest(request);
    setConfirmAction(action);
  };

  const closeConfirm = () => {
    setSelectedRequest(null);
    setConfirmAction(null);
  };

  const handleConfirm = () => {
    if (!selectedRequest || !confirmAction) return;

    resolveRequest(
      {
        requestId: selectedRequest.id,
        action: confirmAction,
      },
      {
        onSuccess: closeConfirm,
      }
    );
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <Bug className="h-5 w-5 text-amber-500" />
          <h1 className="text-2xl font-bold text-gray-900">오류 신고 관리</h1>
        </div>
        <p className="text-sm text-gray-500">홈페이지 오류 신고(pending) 목록입니다.</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        <table className="min-w-[980px] w-full text-left">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/80">
              <th className="w-36 px-4 py-3 text-xs font-semibold uppercase text-gray-500">
                신고일시
              </th>
              <th className="w-56 px-4 py-3 text-xs font-semibold uppercase text-gray-500">
                오류 제목
              </th>
              <th className="min-w-[520px] px-4 py-3 text-xs font-semibold uppercase text-gray-500">
                상세 내용
              </th>
              <th className="w-56 px-4 py-3 text-xs font-semibold uppercase text-gray-500">
                신고자
              </th>
              <th className="w-36 px-4 py-3 text-xs font-semibold uppercase text-gray-500">
                처리
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(5)].map((_, index) => (
                <tr key={`pending-error-report-skeleton-${index}`} className="border-b border-gray-100">
                  <td colSpan={5} className="px-4 py-3">
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))
            ) : requests && requests.length > 0 ? (
              requests.map((request) => (
                <tr
                  key={`pending-error-report-${request.id}`}
                  className="border-b border-gray-100 transition-colors hover:bg-gray-50/60"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-500">
                    {new Date(request.reported_at).toLocaleString("ko-KR")}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-800">
                    {request.title}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="max-w-[560px] overflow-x-auto whitespace-pre-wrap break-words">
                      {request.detail}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {request.reporter_nickname ?? ""}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <AdminRequestActionButtons
                      onApprove={() => openConfirm(request, "approve")}
                      onReject={() => openConfirm(request, "reject")}
                      disabled={isPending}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-14 text-center text-sm text-gray-400">
                  처리 대기 중인 오류 신고가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ConfirmAlert
        open={Boolean(selectedRequest && confirmAction)}
        title={confirmAction === "approve" ? "오류 신고 확인" : "오류 신고 거절"}
        description={
          confirmAction === "approve"
            ? `확인하시겠습니까? 로그인 신고자에게 ${ADMIN_ERROR_REPORT_REWARD_POINT}하트를 지급합니다.`
            : "거절하시겠습니까?"
        }
        confirmText={confirmAction === "approve" ? "확인" : "거절"}
        cancelText="취소"
        isPending={isPending}
        confirmVariant={confirmAction === "approve" ? "default" : "danger"}
        onConfirm={handleConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
}
