"use client";

import { useState } from "react";
import { toast } from "sonner";
import { STREAMER_INFO_EDIT_REQUEST_MODAL_TEXT } from "@/lib/constant";
import { useCreateLiveBoxInfoEditRequest } from "@/hooks/mutations/live-box/use-create-live-box-info-edit-request";
import { useAuthStore } from "@/store/useAuthStore";

type UseLiveBoxDetailActionsParams = {
  liveBoxId: number;
  liveBoxTitle: string;
};

export function useLiveBoxDetailActions({
  liveBoxId,
  liveBoxTitle,
}: UseLiveBoxDetailActionsParams) {
  const [isInfoEditModalOpen, setIsInfoEditModalOpen] = useState(false);
  const { user, profile } = useAuthStore();
  const {
    mutateAsync: createInfoEditRequest,
    isPending: isInfoEditRequestSubmitting,
  } = useCreateLiveBoxInfoEditRequest();

  const openInfoEditRequestModal = () => {
    if (!user) {
      toast.error("로그인 후 정보 수정 요청이 가능합니다.");
      return;
    }
    setIsInfoEditModalOpen(true);
  };

  const closeInfoEditRequestModal = () => {
    setIsInfoEditModalOpen(false);
  };

  const handleSubmitInfoEditRequest = async (content: string) => {
    if (!user) {
      toast.error("로그인 후 정보 수정 요청이 가능합니다.");
      return;
    }

    try {
      await createInfoEditRequest({
        content,
        liveBoxId,
        liveBoxTitle,
        requesterNickname: profile?.nickname || null,
      });
      toast.success(STREAMER_INFO_EDIT_REQUEST_MODAL_TEXT.submitSuccess);
      setIsInfoEditModalOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "정보 수정 요청 접수에 실패했습니다.";
      toast.error(message);
    }
  };

  return {
    user,
    isInfoEditModalOpen,
    isInfoEditRequestSubmitting,
    openInfoEditRequestModal,
    closeInfoEditRequestModal,
    handleSubmitInfoEditRequest,
  };
}
