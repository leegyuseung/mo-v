"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmAlert from "@/components/common/confirm-alert";
import { useStreamerInfoEditRequests } from "@/hooks/queries/admin/use-streamer-info-edit-requests";
import { useDeleteStreamerInfoEditRequest } from "@/hooks/mutations/admin/use-delete-streamer-info-edit-request";
import type { StreamerInfoEditRequest } from "@/types/admin";
import { UserRoundPen } from "lucide-react";

function InfoEditRequestRow({ request }: { request: StreamerInfoEditRequest }) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const { mutate: deleteRequest, isPending } = useDeleteStreamerInfoEditRequest();

  const handleConfirm = () => {
    deleteRequest(request.id, {
      onSuccess: () => {
        setIsConfirmOpen(false);
      },
    });
  };

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
        <td className="px-4 py-3 text-sm text-gray-500">
          {new Date(request.created_at).toLocaleString("ko-KR")}
        </td>
        <td className="px-4 py-3 text-sm font-medium text-gray-800">
          {request.streamer_nickname}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {request.requester_nickname || request.requester_id}
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
        title="요청 확인"
        description="확인하시겠습니까? 확인 후 요청 데이터는 삭제됩니다."
        confirmText="확인"
        cancelText="취소"
        isPending={isPending}
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </>
  );
}

export default function InfoEditRequestsScreen() {
  const { data: requests, isLoading } = useStreamerInfoEditRequests();

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <UserRoundPen className="w-5 h-5 text-indigo-500" />
          <h1 className="text-2xl font-bold text-gray-900">정보 수정 요청</h1>
        </div>
        <p className="text-sm text-gray-500">유저가 보낸 정보 수정 요청 목록입니다.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-left min-w-[980px]">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">요청일시</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">버츄얼</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">요청자</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">수정 요청 내용</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-28">처리</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(4)].map((_, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="px-4 py-3" colSpan={5}>
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))
            ) : requests && requests.length > 0 ? (
              requests.map((request) => (
                <InfoEditRequestRow key={request.id} request={request} />
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-14 text-center text-gray-400 text-sm">
                  수정 요청이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
