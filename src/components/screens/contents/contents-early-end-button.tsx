"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEarlyEndContent } from "@/hooks/mutations/contents/use-early-end-content";
import { useAuthStore } from "@/store/useAuthStore";
import type { ContentsEarlyEndButtonProps } from "@/types/contents-detail";

/** 작성자 또는 관리자만 콘텐츠를 조기마감 처리할 수 있는 버튼 */
export default function ContentsEarlyEndButton({
  contentId,
  authorId,
  status,
}: ContentsEarlyEndButtonProps) {
  const router = useRouter();
  const { mutateAsync: requestEarlyEnd, isPending } = useEarlyEndContent();
  const { user, profile, isLoading } = useAuthStore();

  const isAuthor = Boolean(user?.id && authorId && user.id === authorId);
  const isAdmin = (profile?.role || "").trim().toLowerCase() === "admin";
  const canManage = isAuthor || isAdmin;
  const canEarlyEnd = canManage && status === "approved";

  if (isLoading || !canManage) {
    return null;
  }

  const onClickEarlyEnd = async () => {
    if (!canEarlyEnd || isPending) return;

    try {
      await requestEarlyEnd(contentId);
      toast.success("조기마감 처리되었습니다.");
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "조기마감 처리에 실패했습니다.";
      toast.error(message);
    }
  };

  return (
    <div className="mt-2">
      <button
        type="button"
        className="cursor-pointer inline-flex h-9 w-full items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        onClick={onClickEarlyEnd}
        disabled={!canEarlyEnd || isPending}
      >
        {isPending ? "처리중..." : "조기마감"}
      </button>
    </div>
  );
}
