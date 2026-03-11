"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  deleteNoticeDraft,
  fetchMyNoticeDrafts,
  publishNotice,
  saveNoticeDraft,
} from "@/api/notice";
import type { RichTextEditorHandle } from "@/components/common/rich-text-editor";
import type { NoticeCategory, NoticePost } from "@/types/notice";

export function useNoticeWrite() {
  const router = useRouter();
  const editorRef = useRef<RichTextEditorHandle>(null);
  const [draftId, setDraftId] = useState<number | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [category, setCategory] = useState<NoticeCategory>("notice");
  const [drafts, setDrafts] = useState<NoticePost[]>([]);
  const [isDraftDialogOpen, setIsDraftDialogOpen] = useState(false);
  const [isDraftListLoading, setIsDraftListLoading] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasLoadedDrafts, setHasLoadedDrafts] = useState(false);
  const [deletingDraftId, setDeletingDraftId] = useState<number | null>(null);

  function validateBeforeSubmit() {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      toast.error("제목을 입력해 주세요.");
      return false;
    }

    if (editorRef.current?.isEmpty()) {
      toast.error("본문을 입력해 주세요.");
      return false;
    }

    return true;
  }

  function getEditorHtml() {
    return editorRef.current?.getHTML() || "";
  }

  async function handleSubmit() {
    if (!validateBeforeSubmit()) return;

    setIsPublishing(true);

    try {
      const result = await publishNotice({
        id: draftId,
        category,
        title: title.trim(),
        contentHtml: getEditorHtml(),
        isPinned,
      });

      setDraftId(result.id);
      toast.success("공지사항을 등록했습니다.");
      router.push("/notice");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "공지사항 등록에 실패했습니다."
      );
    } finally {
      setIsPublishing(false);
    }
  }

  async function handleSaveDraft() {
    const trimmedTitle = title.trim();
    const isEditorEmpty = editorRef.current?.isEmpty() ?? true;

    if (!trimmedTitle && isEditorEmpty) {
      toast.error("임시저장하려면 제목이나 본문 중 하나는 입력해 주세요.");
      return;
    }

    setIsSavingDraft(true);

    try {
      const result = await saveNoticeDraft({
        id: draftId,
        category,
        title: trimmedTitle,
        contentHtml: getEditorHtml(),
        isPinned,
      });

      setDraftId(result.id);
      toast.success("임시저장했습니다.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "임시저장에 실패했습니다."
      );
    } finally {
      setIsSavingDraft(false);
    }
  }

  // Why: draft 팝업을 열기 전에 미리 목록을 받아두면 첫 진입 체감이 훨씬 좋아진다.
  async function loadDraftPosts(force = false) {
    if (isDraftListLoading) return;
    if (hasLoadedDrafts && !force) return;

    setIsDraftListLoading(true);

    try {
      const nextDrafts = await fetchMyNoticeDrafts();
      setDrafts(nextDrafts);
      setHasLoadedDrafts(true);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "임시저장글 목록을 불러오지 못했습니다."
      );
    } finally {
      setIsDraftListLoading(false);
    }
  }

  async function handleOpenDraftPosts() {
    setIsDraftDialogOpen(true);
    await loadDraftPosts();
  }

  function handlePrefetchDraftPosts() {
    void loadDraftPosts();
  }

  function handleCancel() {
    router.push("/notice");
  }

  function handleLoadDraft(draft: NoticePost) {
    setDraftId(draft.id);
    setCategory(draft.category);
    setTitle(draft.title);
    setIsPinned(draft.is_pinned);
    editorRef.current?.setHTML(draft.content_html || "");
    setIsDraftDialogOpen(false);
    toast.success("임시저장글을 불러왔습니다.");
  }

  // Why: 현재 편집 중이던 draft를 삭제한 경우 stale id가 남으면 이후 저장이 깨질 수 있다.
  async function handleDeleteDraft(draft: NoticePost) {
    setDeletingDraftId(draft.id);

    try {
      await deleteNoticeDraft(draft.id);
      setDrafts((current) => current.filter((item) => item.id !== draft.id));

      if (draftId === draft.id) {
        setDraftId(undefined);
      }

      toast.success("임시저장글을 삭제했습니다.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "임시저장글 삭제에 실패했습니다."
      );
    } finally {
      setDeletingDraftId(null);
    }
  }

  return {
    editorRef,
    title,
    setTitle,
    isPinned,
    setIsPinned,
    category,
    setCategory,
    drafts,
    draftId,
    isDraftDialogOpen,
    setIsDraftDialogOpen,
    isDraftListLoading,
    isSavingDraft,
    isPublishing,
    deletingDraftId,
    handleSubmit,
    handleSaveDraft,
    handleOpenDraftPosts,
    handlePrefetchDraftPosts,
    handleCancel,
    handleLoadDraft,
    handleDeleteDraft,
  };
}
