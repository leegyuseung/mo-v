"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import ConfirmAlert from "@/components/common/confirm-alert";
import AdminRequestActionButtons from "@/components/common/admin-request-action-buttons";
import { useUpdateLiveBoxRequestStatus } from "@/hooks/mutations/admin/use-update-live-box-request-status";
import { formatLiveBoxDateTime } from "@/utils/admin-live-box";
import type { LiveBoxAdminPendingRequest } from "@/types/live-box-request";

type LiveBoxPendingRequestRowProps = {
  request: LiveBoxAdminPendingRequest;
};

/** 관리자 박스 등록 요청 대기 행 */
export default function LiveBoxPendingRequestRow({ request }: LiveBoxPendingRequestRowProps) {
  const [isRejectAlertOpen, setIsRejectAlertOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateLiveBoxRequestStatus();

  return (
    <>
      <tr className="border-b border-gray-100 align-middle">
        <td className="px-4 py-3 text-sm text-gray-700">{request.id}</td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {request.requester_profile?.nickname || request.requester_id}
        </td>
        <td className="px-4 py-3 text-sm font-medium text-gray-800 min-w-[380px]">{request.topic}</td>
        <td className="px-4 py-3 text-sm text-gray-600">
          <a
            href={request.related_site}
            target="_blank"
            rel="noreferrer"
            className="inline-block max-w-[360px] truncate text-blue-500 underline underline-offset-2 hover:text-blue-600"
            title={request.related_site}
          >
            {request.related_site}
          </a>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">{formatLiveBoxDateTime(request.created_at)}</td>
        <td className="px-4 py-3 text-sm text-gray-600">
          <AdminRequestActionButtons
            approveLabel="완료"
            rejectLabel="거절"
            onApprove={() =>
              updateStatus({
                requestId: request.id,
                status: "approved",
              })
            }
            onReject={() => setIsRejectAlertOpen(true)}
            disabled={isUpdatingStatus}
          />
        </td>
      </tr>

      <ConfirmAlert
        open={isRejectAlertOpen}
        title="박스 등록 요청 거절"
        description="거절 사유를 입력해 주세요. 사유와 처리자 ID가 함께 저장됩니다."
        confirmText="거절"
        cancelText="취소"
        isPending={isUpdatingStatus}
        confirmDisabled={!rejectReason.trim()}
        onConfirm={() =>
          updateStatus(
            {
              requestId: request.id,
              status: "rejected",
              reviewNote: rejectReason.trim(),
            },
            {
              onSuccess: () => {
                setIsRejectAlertOpen(false);
                setRejectReason("");
              },
            }
          )
        }
        onCancel={() => {
          setIsRejectAlertOpen(false);
          setRejectReason("");
        }}
      >
        <Textarea
          value={rejectReason}
          onChange={(event) => setRejectReason(event.target.value)}
          placeholder="거절 사유를 입력해 주세요."
          className="min-h-[88px]"
        />
      </ConfirmAlert>
    </>
  );
}
