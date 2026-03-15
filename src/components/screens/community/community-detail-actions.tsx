"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, Pencil, Siren, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteCommunityPost } from "@/api/community";

type CommunityDetailActionsProps = {
  postId: number;
  isLoggedIn: boolean;
  isAuthor: boolean;
  canManage: boolean;
  editHref: string;
  backHref: string;
};

export default function CommunityDetailActions({
  postId,
  isLoggedIn,
  isAuthor,
  canManage,
  editHref,
  backHref,
}: CommunityDetailActionsProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen]);

  async function handleDelete() {
    const confirmed = window.confirm("이 커뮤니티 글을 삭제할까요?");
    if (!confirmed) return;

    setIsDeleting(true);

    try {
      await deleteCommunityPost(postId);
      toast.success("커뮤니티 글을 삭제했습니다.");
      router.push(backHref);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "커뮤니티 글 삭제에 실패했습니다."
      );
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  }

  if (!isLoggedIn) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
        aria-label="더보기"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-12 z-10 min-w-36 rounded-xl border border-gray-200 bg-white p-1 shadow-lg">
          {canManage ? (
            <>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  router.push(editHref);
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Pencil className="h-4 w-4" />
                <span>수정하기</span>
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                <span>{isDeleting ? "삭제 중..." : "삭제하기"}</span>
              </button>
            </>
          ) : null}
          {!isAuthor && !canManage ? (
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                toast.info("신고 기능은 준비 중입니다.");
              }}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50"
            >
              <Siren className="h-4 w-4" />
              <span>신고하기</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
