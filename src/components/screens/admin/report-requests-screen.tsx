"use client";

import { useState } from "react";
import { Siren } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmAlert from "@/components/common/confirm-alert";
import { useEntityReportRequests } from "@/hooks/queries/admin/use-entity-report-requests";
import { useDeleteEntityReportRequest } from "@/hooks/mutations/admin/use-delete-entity-report-request";
import type { EntityReportRequest } from "@/types/report";

function targetTypeLabel(targetType: EntityReportRequest["target_type"]) {
  if (targetType === "streamer") return "버츄얼";
  if (targetType === "group") return "그룹";
  return "소속";
}

function ReportRequestRow({ request }: { request: EntityReportRequest }) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { mutate: deleteRequest, isPending } = useDeleteEntityReportRequest();

  const handleConfirm = () => {
    deleteRequest(request.id, {
      onSuccess: () => setIsConfirmOpen(false),
    });
  };

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
        <td className="px-4 py-3 text-sm text-gray-500">
          {new Date(request.created_at).toLocaleString("ko-KR")}
        </td>
        <td className="px-4 py-3 text-sm text-gray-700">{targetTypeLabel(request.target_type)}</td>
        <td className="px-4 py-3 text-sm font-medium text-gray-800">{request.target_name || "-"}</td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {request.reporter_nickname || request.reporter_id}
        </td>
        <td className="px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap break-words">
          {request.content}
        </td>
        <td className="px-4 py-3 text-sm">
          <Button
            type="button"
            size="sm"
            onClick={() => setIsConfirmOpen(true)}
            className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            확인
          </Button>
        </td>
      </tr>

      <ConfirmAlert
        open={isConfirmOpen}
        title="신고 확인"
        description="확인하시겠습니까? 확인 후 신고 데이터는 삭제됩니다."
        confirmText="확인"
        cancelText="취소"
        isPending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}

export default function ReportRequestsScreen() {
  const { data: requests, isLoading } = useEntityReportRequests();

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Siren className="w-5 h-5 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900">신고 관리</h1>
        </div>
        <p className="text-sm text-gray-500">유저가 보낸 신고 목록입니다.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left min-w-[1040px]">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">요청일시</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">구분</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">대상명</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">요청자</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">신고 내용</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-28">처리</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(4)].map((_, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="px-4 py-3" colSpan={6}>
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))
            ) : requests && requests.length > 0 ? (
              requests.map((request) => <ReportRequestRow key={request.id} request={request} />)
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-14 text-center text-gray-400 text-sm">
                  신고 내역이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
