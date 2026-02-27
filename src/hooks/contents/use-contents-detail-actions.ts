"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useCreateContentInfoEditRequest } from "@/hooks/mutations/contents/use-create-content-info-edit-request";
import { useTrackContentView } from "@/hooks/mutations/contents/use-track-content-view";
import { useToggleContentFavorite } from "@/hooks/mutations/contents/use-toggle-content-favorite";
import { useCreateEntityReportRequest } from "@/hooks/mutations/reports/use-create-entity-report-request";
import { useFavoriteContentIds } from "@/hooks/queries/contents/use-favorite-content-ids";
import { ENTITY_REPORT_MODAL_TEXT, STREAMER_INFO_EDIT_REQUEST_MODAL_TEXT } from "@/lib/constant";
import { useAuthStore } from "@/store/useAuthStore";
import type {
  UseContentsDetailActionsParams,
  UseContentsDetailActionsResult,
} from "@/types/contents-detail";

/** 콘텐츠 상세 액션바의 상태/비즈니스 로직을 분리한다. */
export function useContentsDetailActions({
  authorId,
  contentId,
  contentTitle,
  contentStatus,
  initialViewCount,
  initialIsLiked,
}: UseContentsDetailActionsParams): UseContentsDetailActionsResult {
  const hasTrackedViewRef = useRef(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEditRequestModalOpen, setIsEditRequestModalOpen] = useState(false);
  const [viewCount, setViewCount] = useState(initialViewCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isFavoritePending, setIsFavoritePending] = useState(false);
  const { user, profile, isLoading: isAuthLoading } = useAuthStore();
  const { mutateAsync: requestTrackView } = useTrackContentView();
  const { mutateAsync: requestToggleFavorite } = useToggleContentFavorite();
  const favoriteContentIdsQuery = useFavoriteContentIds(Boolean(user) && !isAuthLoading);
  const {
    mutateAsync: createInfoEditRequest,
    isPending: isInfoEditSubmitting,
  } = useCreateContentInfoEditRequest();
  const {
    mutateAsync: createReportRequest,
    isPending: isReportSubmitting,
  } = useCreateEntityReportRequest();
  const isAuthor = Boolean(user?.id && authorId && user.id === authorId);
  const isEnded = contentStatus === "ended";

  useEffect(() => {
    if (hasTrackedViewRef.current) return;
    if (!Number.isFinite(contentId) || contentId <= 0) return;
    if (isEnded) return;

    hasTrackedViewRef.current = true;

    void requestTrackView(contentId)
      .then((body) => {
        if (body && typeof body.view_count === "number") {
          setViewCount(body.view_count);
        }
      })
      .catch(() => {
        // 조회수 실패는 상세 열람을 막지 않는다.
      });
  }, [contentId, isEnded, requestTrackView]);

  useEffect(() => {
    if (!user) {
      setIsLiked(false);
      return;
    }

    if (!favoriteContentIdsQuery.isSuccess) return;
    setIsLiked(favoriteContentIdsQuery.data.includes(contentId));
  }, [contentId, favoriteContentIdsQuery.data, favoriteContentIdsQuery.isSuccess, user]);

  const onClickToggleFavorite = async () => {
    if (isEnded) {
      toast.error("종료된 콘텐츠는 좋아요할 수 없습니다.");
      return;
    }
    if (!user) {
      toast.error("로그인 후 좋아요가 가능합니다.");
      return;
    }
    if (isFavoritePending) return;

    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setIsFavoritePending(true);

    try {
      const body = await requestToggleFavorite(contentId);
      setIsLiked(Boolean(body?.liked));
    } catch (error) {
      setIsLiked(wasLiked);
      const message =
        error instanceof Error ? error.message : "좋아요 처리에 실패했습니다.";
      toast.error(message);
    } finally {
      setIsFavoritePending(false);
    }
  };

  const openInfoEditRequestModal = () => {
    if (isEnded) {
      toast.error("종료된 콘텐츠는 정보 수정 요청할 수 없습니다.");
      return;
    }
    if (!user) {
      toast.error("로그인 후 정보 수정 요청이 가능합니다.");
      return;
    }
    if (!isAuthor) {
      toast.error("작성자만 정보 수정 요청이 가능합니다.");
      return;
    }
    setIsEditRequestModalOpen(true);
  };

  const openReportModal = () => {
    if (isEnded) {
      toast.error("종료된 콘텐츠는 신고할 수 없습니다.");
      return;
    }
    if (!user) {
      toast.error("로그인 후 신고가 가능합니다.");
      return;
    }
    setIsReportModalOpen(true);
  };

  const handleSubmitReport = async (content: string) => {
    if (isEnded) {
      toast.error("종료된 콘텐츠는 신고할 수 없습니다.");
      return;
    }
    if (!user) {
      toast.error("로그인 후 신고가 가능합니다.");
      return;
    }

    try {
      await createReportRequest({
        targetType: "contents",
        targetCode: String(contentId),
        targetName: contentTitle || "콘텐츠",
        reporterId: user.id,
        reporterNickname: profile?.nickname || null,
        content,
      });
      toast.success(ENTITY_REPORT_MODAL_TEXT.submitSuccess);
      setIsReportModalOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "신고 접수에 실패했습니다.";
      toast.error(message);
    }
  };

  const handleSubmitInfoEditRequest = async (content: string) => {
    if (isEnded) {
      toast.error("종료된 콘텐츠는 정보 수정 요청할 수 없습니다.");
      return;
    }
    if (!user) {
      toast.error("로그인 후 정보 수정 요청이 가능합니다.");
      return;
    }
    if (!isAuthor) {
      toast.error("작성자만 정보 수정 요청이 가능합니다.");
      return;
    }

    try {
      await createInfoEditRequest({
        content,
        contentId,
        contentTitle,
        requesterId: user.id,
        requesterNickname: profile?.nickname || null,
      });
      toast.success(STREAMER_INFO_EDIT_REQUEST_MODAL_TEXT.submitSuccess);
      setIsEditRequestModalOpen(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "정보 수정 요청 접수에 실패했습니다.";
      toast.error(message);
    }
  };

  return {
    viewCount,
    isLiked,
    isEnded,
    isReportModalOpen,
    isEditRequestModalOpen,
    isFavoritePending,
    isInfoEditSubmitting,
    isReportSubmitting,
    isAuthor,
    userId: user?.id ?? null,
    openInfoEditRequestModal,
    openReportModal,
    onClickToggleFavorite,
    onCloseInfoEditModal: () => setIsEditRequestModalOpen(false),
    onCloseReportModal: () => setIsReportModalOpen(false),
    handleSubmitReport,
    handleSubmitInfoEditRequest,
  };
}
