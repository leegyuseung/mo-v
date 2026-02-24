"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import ConfirmAlert from "@/components/common/confirm-alert";
import { useStreamerInfoEditRequests } from "@/hooks/queries/admin/use-streamer-info-edit-requests";
import { useResolveStreamerInfoEditRequest } from "@/hooks/mutations/admin/use-delete-streamer-info-edit-request";
import type { InfoEditRequestRowProps } from "@/types/admin";
import { UserRoundPen } from "lucide-react";
import { ADMIN_REVIEW_REWARD_POINT } from "@/lib/constant";

/** 정보 수정 요청 테이블의 개별 행 — 확인/거절 액션 포함 */
function InfoEditRequestRow({ request }: InfoEditRequestRowProps) {
  /** 확인/거절 다이얼로그 노출 상태 */
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const { mutate: resolveRequest, isPending } = useResolveStreamerInfoEditRequest();

  /** 확인/거절 처리 핸들러 */
  const handleConfirm = () => {
    if (!confirmAction) return;

    resolveRequest(
      {
        requestId: request.id,
        action: confirmAction,
        reviewNote: confirmAction === "reject" ? reviewNote.trim() : undefined,
      },
      {
        onSuccess: () => {
          setConfirmAction(null);
          setReviewNote("");
        },
      },
    );
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
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              onClick={() => setConfirmAction("approve")}
              className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              확인
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setConfirmAction("reject")}
              className="cursor-pointer border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              거절
            </Button>
          </div>
        </td>
      </tr>

      <ConfirmAlert
        open={Boolean(confirmAction)}
        title={confirmAction === "approve" ? "요청 확인" : "요청 거절"}
        description={
          confirmAction === "approve"
            ? `확인하시겠습니까? 요청자에게 ${ADMIN_REVIEW_REWARD_POINT}하트가 지급되고 요청 상태가 저장됩니다.`
            : "거절하시겠습니까? 하트 지급 없이 요청 상태가 저장됩니다."
        }
        confirmText={confirmAction === "approve" ? "확인" : "거절"}
        cancelText="취소"
        isPending={isPending}
        confirmDisabled={confirmAction === "reject" && !reviewNote.trim()}
        onConfirm={handleConfirm}
        onCancel={() => {
          setConfirmAction(null);
          setReviewNote("");
        }}
      >
        {confirmAction === "reject" ? (
          <Textarea
            value={reviewNote}
            onChange={(event) => setReviewNote(event.target.value)}
            placeholder="거절 사유를 입력해 주세요."
            className="min-h-[88px]"
          />
        ) : null}
      </ConfirmAlert>
    </>
  );
}

/** 관리자 정보 수정 요청 화면 — 요청 목록 조회 및 확인/거절 처리 */
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
