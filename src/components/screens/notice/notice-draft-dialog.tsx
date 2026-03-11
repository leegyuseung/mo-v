"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { NoticeDraftDialogProps } from "@/types/notice-write";

function formatDraftDate(value: string) {
  return new Date(value).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NoticeDraftDialog({
  drafts,
  isLoading,
  isOpen,
  deletingDraftId,
  onOpenChange,
  onSelectDraft,
  onDeleteDraft,
}: NoticeDraftDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>임시저장글</DialogTitle>
          <DialogDescription>
            최근 임시저장한 공지사항을 불러올 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
            임시저장글을 불러오는 중입니다.
          </div>
        ) : drafts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
            임시저장된 글이 없습니다.
          </div>
        ) : (
          <div className="space-y-2">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="flex items-start gap-2 rounded-xl border border-gray-200 px-4 py-3 transition-colors hover:bg-gray-50"
              >
                <button
                  type="button"
                  onClick={() => onSelectDraft(draft)}
                  className="flex min-w-0 flex-1 cursor-pointer items-start justify-between gap-4 text-left"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {draft.is_pinned ? (
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                          상단 고정
                        </span>
                      ) : null}
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700">
                        {draft.category === "event" ? "이벤트" : "공지"}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {draft.title || "(제목 없음)"}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-gray-500">
                    {formatDraftDate(draft.updated_at)}
                  </span>
                </button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0 cursor-pointer"
                  onClick={() => onDeleteDraft(draft)}
                  disabled={deletingDraftId === draft.id}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">임시저장글 삭제</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
