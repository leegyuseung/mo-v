"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import ConfirmAlert from "@/components/common/confirm-alert";
import AdminRequestActionButtons from "@/components/common/admin-request-action-buttons";
import type { ContentWithAuthorProfile } from "@/types/content";

type ContentPendingRequestRowProps = {
  request: ContentWithAuthorProfile;
  isPendingAction: boolean;
  onApprove: (contentId: number) => void;
  onReject: (contentId: number, reviewNote: string) => void;
  onViewDetail: (request: ContentWithAuthorProfile) => void;
};

/** 관리자 콘텐츠 등록 요청 대기 행 */
export default function ContentPendingRequestRow({
  request,
  isPendingAction,
  onApprove,
  onReject,
  onViewDetail,
}: ContentPendingRequestRowProps) {
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  return (
    <>
      <tr className="border-b border-gray-100 align-middle">
        <td className="px-4 py-3 text-sm text-gray-600">
          {request.author_profile?.nickname || request.created_by}
        </td>
        <td className="px-4 py-3 text-sm font-medium text-gray-800">{request.title}</td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {new Date(request.created_at).toLocaleString("ko-KR")}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onViewDetail(request)}
              className="cursor-pointer"
            >
              내용보기
            </Button>
            <AdminRequestActionButtons
              approveLabel="완료"
              rejectLabel="거절"
              onApprove={() => setConfirmAction("approve")}
              onReject={() => setConfirmAction("reject")}
              disabled={isPendingAction}
            />
          </div>
        </td>
      </tr>

      <ConfirmAlert
        open={confirmAction !== null}
        title={confirmAction === "approve" ? "등록 요청 완료 처리" : "등록 요청 거절 처리"}
        description={
          confirmAction === "approve"
            ? "선택한 콘텐츠 요청을 완료(승인) 상태로 변경합니다."
            : "선택한 콘텐츠 요청을 거절 상태로 변경합니다."
        }
        confirmText={confirmAction === "approve" ? "완료" : "거절"}
        confirmVariant={confirmAction === "approve" ? "default" : "danger"}
        cancelText="취소"
        isPending={isPendingAction}
        confirmDisabled={confirmAction === "reject" && !rejectReason.trim()}
        onConfirm={() => {
          if (confirmAction === "approve") {
            onApprove(request.id);
          } else {
            onReject(request.id, rejectReason.trim());
          }
          setConfirmAction(null);
          setRejectReason("");
        }}
        onCancel={() => {
          setConfirmAction(null);
          setRejectReason("");
        }}
      >
        {confirmAction === "reject" ? (
          <Textarea
            value={rejectReason}
            onChange={(event) => setRejectReason(event.target.value)}
            placeholder="거절 사유를 입력해 주세요."
            className="min-h-[88px]"
          />
        ) : null}
      </ConfirmAlert>
    </>
  );
}
