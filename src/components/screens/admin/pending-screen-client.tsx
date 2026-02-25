"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { usePendingStreamerRequests } from "@/hooks/queries/admin/use-pending-streamer-requests";
import StreamerRequestTriggerButton from "@/components/common/streamer-request-trigger-button";
import PendingRequestRow from "@/components/screens/admin/pending-request-row";

/** 관리자 버츄얼 등록 대기 화면 — 요청 목록 조회 및 등록/거절 처리 */
export default function PendingScreen() {
  const queryClient = useQueryClient();
  const { data: requests, isLoading } = usePendingStreamerRequests();

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-amber-500" />
            <h1 className="text-2xl font-bold text-gray-900">버츄얼 등록 대기</h1>
          </div>
          <p className="text-sm text-gray-500">유저가 요청한 버츄얼 등록 대기 목록입니다.</p>
        </div>
        <StreamerRequestTriggerButton
          className="h-9 cursor-pointer whitespace-nowrap border-gray-200 text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          onSubmitted={() =>
            queryClient.invalidateQueries({
              queryKey: ["admin", "pending-streamer-requests"],
            })
          }
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="min-w-[3400px] text-left">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">플랫폼</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">요청 주소</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">닉네임</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">이미지 주소</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">치지직 ID</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">SOOP ID</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">그룹명(text[])</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">소속명(text[])</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">생일</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">국적</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">성별</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">장르</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">첫 방송일</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">팬덤명</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">MBTI</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">별명</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">플랫폼 주소</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">팬카페 주소</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">유튜브 주소</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">요청일시</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-52">처리</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(4)].map((_, index) => (
                <tr key={`pending-streamer-skeleton-${index}`} className="border-b border-gray-100">
                  <td className="px-4 py-3" colSpan={21}>
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))
            ) : requests && requests.length > 0 ? (
              requests.map((request) => <PendingRequestRow key={request.id} request={request} />)
            ) : (
              <tr>
                <td colSpan={21} className="px-4 py-14 text-center text-gray-400 text-sm">
                  등록 대기 요청이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
