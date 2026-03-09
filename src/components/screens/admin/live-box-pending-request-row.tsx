"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import ConfirmAlert from "@/components/common/confirm-alert";
import AdminRequestActionButtons from "@/components/common/admin-request-action-buttons";
import LiveBoxFormPanel from "@/components/screens/admin/live-box-form-panel";
import { useUpdateLiveBoxRequestStatus } from "@/hooks/mutations/admin/use-update-live-box-request-status";
import { useLiveBoxRequestApprovalForm } from "@/hooks/admin/use-live-box-request-approval-form";
import { formatLiveBoxDateTime } from "@/utils/admin-live-box";
import type { LiveBoxParticipantCandidate } from "@/types/admin-live-box";
import type { LiveBoxStatus } from "@/types/live-box";
import type { LiveBoxAdminPendingRequest } from "@/types/live-box-request";

type LiveBoxPendingRequestRowProps = {
  request: LiveBoxAdminPendingRequest;
  participantCandidates: LiveBoxParticipantCandidate[];
};

/** 관리자 박스 등록 요청 대기 행 */
const STATUS_OPTIONS: LiveBoxStatus[] = ["대기", "진행중", "종료"];

export default function LiveBoxPendingRequestRow({
  request,
  participantCandidates,
}: LiveBoxPendingRequestRowProps) {
  const [isRejectAlertOpen, setIsRejectAlertOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useUpdateLiveBoxRequestStatus();
  const approvalForm = useLiveBoxRequestApprovalForm({ request, participantCandidates });

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
            approveLabel="등록"
            rejectLabel="거절"
            onApprove={approvalForm.openApprovePanel}
            onReject={() => setIsRejectAlertOpen(true)}
            disabled={isUpdatingStatus || approvalForm.isSubmitting}
          />
        </td>
      </tr>

      {approvalForm.isApproveOpen ? (
        <tr className="border-b border-gray-100 bg-gray-50/60">
          <td colSpan={6} className="px-4 py-4">
            <LiveBoxFormPanel
              editingLiveBoxId={null}
              panelTitle={`박스 등록 승인 #${request.id}`}
              submitLabel="등록 완료"
              submittingLabel="등록중..."
              title={approvalForm.title}
              categoryInput={approvalForm.categoryInput}
              participantSearch={approvalForm.participantSearch}
              selectedParticipants={approvalForm.selectedParticipants}
              filteredParticipants={approvalForm.filteredParticipants}
              startsAt={approvalForm.startsAt}
              endsAt={approvalForm.endsAt}
              urlTitle={approvalForm.urlTitle}
              url={approvalForm.url}
              description={approvalForm.description}
              status={approvalForm.status}
              statusOptions={STATUS_OPTIONS}
              isSubmitting={approvalForm.isSubmitting}
              onTitleChange={approvalForm.setTitle}
              onCategoryInputChange={approvalForm.setCategoryInput}
              onParticipantSearchChange={approvalForm.setParticipantSearch}
              onAddParticipant={approvalForm.addParticipant}
              onRemoveParticipant={approvalForm.removeParticipant}
              onStartsAtChange={approvalForm.setStartsAt}
              onEndsAtChange={approvalForm.setEndsAt}
              onUrlTitleChange={approvalForm.setUrlTitle}
              onUrlChange={approvalForm.setUrl}
              onDescriptionChange={approvalForm.setDescription}
              onStatusChange={approvalForm.setStatus}
              onCancel={approvalForm.closeApprovePanel}
              onSubmit={approvalForm.handleApprove}
            />
          </td>
        </tr>
      ) : null}

      <ConfirmAlert
        open={isRejectAlertOpen}
        title="박스 등록 요청 거절"
        description="거절 사유를 입력해 주세요. 사유와 처리자 ID가 함께 저장됩니다."
        confirmText="거절"
        cancelText="취소"
        isPending={isUpdatingStatus || approvalForm.isSubmitting}
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
