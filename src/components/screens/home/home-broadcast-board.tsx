"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Megaphone } from "lucide-react";
import { toast } from "sonner";
import ConfirmAlert from "@/components/common/confirm-alert";
import { useAuthStore } from "@/store/useAuthStore";
import { HOME_BROADCAST_COST_POINT } from "@/lib/constant";
import { hasAdminAccess } from "@/utils/role";
import { useHomeBroadcasts } from "@/hooks/queries/home/use-home-broadcasts";
import { useCreateHomeBroadcast } from "@/hooks/mutations/home/use-create-home-broadcast";
import { useDeleteHomeBroadcast } from "@/hooks/mutations/home/use-delete-home-broadcast";
import { Textarea } from "@/components/ui/textarea";
import HomeBroadcastCreateModal from "@/components/screens/home/home-broadcast-create-modal";
import HomeBroadcastFeed from "@/components/screens/home/home-broadcast-feed";
import type { HomeBroadcastItem } from "@/types/home-broadcast";

const HOME_BROADCAST_COLLAPSED_ROTATE_MS = 3000;

/**
 * 홈 전광판(확성기) 영역.
 * - 기본: 한 줄 높이
 * - 펼침: 진행중 메시지 개수만큼 확장
*/
export default function HomeBroadcastBoard() {
  const { user, profile, heartPoints, setHeartPoints } = useAuthStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [contentInput, setContentInput] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<HomeBroadcastItem | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [nowMs, setNowMs] = useState(() => Date.now());
  const [collapsedIndex, setCollapsedIndex] = useState(0);
  const { data, isLoading, isError } = useHomeBroadcasts();
  const { mutateAsync: createBroadcast, isPending: isCreating } = useCreateHomeBroadcast();
  const { mutateAsync: deleteBroadcast, isPending: isDeleting } = useDeleteHomeBroadcast();

  const broadcasts = data?.data || [];
  const activeBroadcasts = broadcasts.filter((item) => item.status === "active");
  const currentPoint = heartPoints?.point || 0;
  const isPointInsufficient = currentPoint < HOME_BROADCAST_COST_POINT;
  const canDeleteBroadcast = hasAdminAccess(profile?.role);
  const collapsedBroadcast =
    activeBroadcasts.length > 0
      ? activeBroadcasts[collapsedIndex % activeBroadcasts.length]
      : null;
  const visibleLines = activeBroadcasts;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNowMs(Date.now());
    }, 30 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isExpanded) return;
    if (activeBroadcasts.length <= 1) return;

    const timer = window.setInterval(() => {
      setCollapsedIndex((prev) => (prev + 1) % activeBroadcasts.length);
    }, HOME_BROADCAST_COLLAPSED_ROTATE_MS);

    return () => window.clearInterval(timer);
  }, [isExpanded, activeBroadcasts.length]);

  const handleOpenCreateModal = () => {
    if (!user) {
      toast.error("로그인 후 이용해 주세요.");
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseCreateModal = () => {
    if (isCreating) return;
    setContentInput("");
    setIsModalOpen(false);
  };

  const handleSubmit = async () => {
    const trimmed = contentInput.trim();
    if (!trimmed) {
      toast.error("내용을 입력해 주세요.");
      return;
    }
    if (!user) {
      toast.error("로그인 후 이용해 주세요.");
      return;
    }
    if (isPointInsufficient) {
      toast.error(`하트가 부족합니다. (${HOME_BROADCAST_COST_POINT}하트 필요)`);
      return;
    }

    try {
      const result = await createBroadcast({ content: trimmed });
      setHeartPoints({
        id: heartPoints?.id || user.id,
        point: result.after_point,
        created_at: heartPoints?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      toast.success("전광판 등록이 완료되었습니다.");
      setContentInput("");
      setIsModalOpen(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "전광판 등록에 실패했습니다.";
      toast.error(message);
    }
  };

  const handleDeleteClick = (broadcast: HomeBroadcastItem) => {
    if (!canDeleteBroadcast) return;
    setDeleteTarget(broadcast);
    setDeleteReason("");
  };

  const handleCloseDeleteAlert = () => {
    if (isDeleting) return;
    setDeleteTarget(null);
    setDeleteReason("");
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    const trimmedReason = deleteReason.trim();
    if (!trimmedReason) {
      toast.error("삭제 사유를 입력해 주세요.");
      return;
    }

    try {
      await deleteBroadcast({
        id: deleteTarget.id,
        reason: trimmedReason,
      });
      toast.success("전광판을 삭제했습니다.");
      handleCloseDeleteAlert();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "전광판 삭제에 실패했습니다.";
      toast.error(message);
    }
  };

  return (
    <>
      <section className="px-4 pt-2 md:px-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
          <div className="flex items-start gap-2">
            <div className="relative shrink-0">
              <button
                type="button"
                aria-label="확성기 등록"
                onClick={handleOpenCreateModal}
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-600 transition-colors hover:bg-gray-100"
              >
                <Megaphone className="h-4 w-4" />
              </button>
              <span className="pointer-events-none absolute -right-2 -top-2 z-10 inline-flex h-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-semibold text-white shadow-sm">
                클릭
              </span>
            </div>

            <HomeBroadcastFeed
              isExpanded={isExpanded}
              isLoading={isLoading}
              isError={isError}
              nowMs={nowMs}
              visibleLines={visibleLines}
              collapsedBroadcast={collapsedBroadcast}
              canDeleteBroadcast={canDeleteBroadcast}
              onDeleteBroadcast={handleDeleteClick}
            />

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                aria-label={isExpanded ? "전광판 접기" : "전광판 펼치기"}
                onClick={() => setIsExpanded((prev) => !prev)}
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition-colors hover:bg-gray-50"
              >
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                />
              </button>
            </div>
          </div>
        </div>
      </section>

      <HomeBroadcastCreateModal
        isOpen={isModalOpen}
        isCreating={isCreating}
        isPointInsufficient={isPointInsufficient}
        currentPoint={currentPoint}
        costPoint={HOME_BROADCAST_COST_POINT}
        contentInput={contentInput}
        onContentInputChange={setContentInput}
        onClose={handleCloseCreateModal}
        onSubmit={handleSubmit}
      />

      <ConfirmAlert
        open={deleteTarget !== null}
        title="전광판 삭제"
        description="삭제 사유를 남기면 전광판을 숨기고 관리자 이력으로 보관합니다."
        confirmText="삭제"
        confirmVariant="danger"
        isPending={isDeleting}
        confirmDisabled={!deleteReason.trim()}
        onCancel={handleCloseDeleteAlert}
        onConfirm={handleDeleteConfirm}
      >
        <Textarea
          value={deleteReason}
          onChange={(event) => setDeleteReason(event.target.value)}
          placeholder="삭제 사유를 입력해 주세요."
          className="min-h-[96px] resize-none"
          maxLength={200}
        />
        <p className="mt-2 text-xs text-gray-400">{deleteReason.trim().length}/200</p>
      </ConfirmAlert>
    </>
  );
}
