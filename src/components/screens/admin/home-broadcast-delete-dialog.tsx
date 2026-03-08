"use client";

import ConfirmAlert from "@/components/common/confirm-alert";
import { Textarea } from "@/components/ui/textarea";
import type { AdminHomeBroadcastDeleteDialogProps } from "@/types/admin-home-broadcast-screen";

export default function HomeBroadcastDeleteDialog({
  deleteReason,
  deleteTarget,
  isDeleting,
  onDeleteReasonChange,
  onClose,
  onConfirm,
}: AdminHomeBroadcastDeleteDialogProps) {
  return (
    <ConfirmAlert
      open={deleteTarget !== null}
      title="전광판 삭제"
      description="삭제 사유를 남기면 전광판을 soft delete 처리합니다."
      confirmText="삭제"
      confirmVariant="danger"
      isPending={isDeleting}
      confirmDisabled={!deleteReason.trim()}
      onCancel={onClose}
      onConfirm={onConfirm}
    >
      <Textarea
        value={deleteReason}
        onChange={(event) => onDeleteReasonChange(event.target.value)}
        placeholder="삭제 사유를 입력해 주세요."
        className="min-h-[96px] resize-none"
        maxLength={200}
      />
      <p className="mt-2 text-xs text-gray-400">{deleteReason.trim().length}/200</p>
    </ConfirmAlert>
  );
}
