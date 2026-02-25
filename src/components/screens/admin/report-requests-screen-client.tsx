"use client";

import { useState } from "react";
import { Siren } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import ConfirmAlert from "@/components/common/confirm-alert";
import AdminRequestActionButtons from "@/components/common/admin-request-action-buttons";
import { useEntityReportRequests } from "@/hooks/queries/admin/use-entity-report-requests";
import { useResolveEntityReportRequest } from "@/hooks/mutations/admin/use-delete-entity-report-request";
import type { EntityReportRequest } from "@/types/report";
import type { ReportRequestRowProps } from "@/types/report-component-props";
import { ADMIN_REVIEW_REWARD_POINT } from "@/lib/constant";

/** 신고 대상 유형을 한국어 레이블로 변환한다 */
function targetTypeLabel(targetType: EntityReportRequest["target_type"]) {
  if (targetType === "streamer") return "버츄얼";
  if (targetType === "group") return "그룹";
  return "소속";
}

/** 신고 요청 테이블의 개별 행 — 확인/거절 액션 포함 */
function ReportRequestRow({ request }: ReportRequestRowProps) {
  /** 확인/거절 다이얼로그 노출 상태 */
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const { mutate: resolveRequest, isPending } = useResolveEntityReportRequest();

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
      }
    );
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
          <AdminRequestActionButtons
            onApprove={() => setConfirmAction("approve")}
            onReject={() => setConfirmAction("reject")}
            disabled={isPending}
          />
        </td>
      </tr>

      <ConfirmAlert
        open={Boolean(confirmAction)}
        title={confirmAction === "approve" ? "신고 확인" : "신고 거절"}
        description={
          confirmAction === "approve"
            ? `확인하시겠습니까? 신고자에게 ${ADMIN_REVIEW_REWARD_POINT}하트가 지급되고 신고 상태가 저장됩니다.`
            : "거절하시겠습니까? 하트 지급 없이 신고 상태가 저장됩니다."
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

/** 관리자 신고 관리 화면 — 신고 목록 조회 및 확인/거절 처리 */
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
