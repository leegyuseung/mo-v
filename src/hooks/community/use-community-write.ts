"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  deleteCommunityDraft,
  fetchMyCommunityDrafts,
  publishCommunityPost,
  saveCommunityDraft,
} from "@/api/community";
import type { RichTextEditorHandle } from "@/components/common/rich-text-editor";
import type { CommunityCategory, CommunityPost } from "@/types/community";

type UseCommunityWriteProps = {
  initialPost?: CommunityPost | null;
  entityName: string;
  entityHref: string;
  communityId: number;
  canManageCommunityNoticeCategory: boolean;
};

export function useCommunityWrite({
  initialPost = null,
  entityName,
  entityHref,
  communityId,
  canManageCommunityNoticeCategory,
}: UseCommunityWriteProps) {
  const router = useRouter();
  const editorRef = useRef<RichTextEditorHandle>(null);
  const [draftId, setDraftId] = useState<number | undefined>(initialPost?.id);
  const [title, setTitle] = useState(initialPost?.title || "");
  const [category, setCategory] = useState<CommunityCategory>(
    initialPost?.category || "general"
  );
  const [drafts, setDrafts] = useState<CommunityPost[]>([]);
  const [isDraftDialogOpen, setIsDraftDialogOpen] = useState(false);
  const [isDraftListLoading, setIsDraftListLoading] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasLoadedDrafts, setHasLoadedDrafts] = useState(false);
  const [deletingDraftId, setDeletingDraftId] = useState<number | null>(null);

  function validateBeforeSubmit() {
    if (!title.trim()) {
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
      const result = await publishCommunityPost({
        id: draftId,
        communityId,
        category,
        title: title.trim(),
        contentHtml: getEditorHtml(),
      });

      setDraftId(result.id);
      toast.success(
        initialPost
          ? `${entityName} 커뮤니티 글을 수정했습니다.`
          : `${entityName} 커뮤니티 글을 등록했습니다.`
      );
      router.push(`${entityHref}/${result.id}`);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "커뮤니티 글 등록에 실패했습니다."
      );
    } finally {
      setIsPublishing(false);
    }
  }

  async function handleSaveDraft() {
    if (initialPost) {
      toast.error("등록된 커뮤니티 글 수정 화면에서는 임시저장을 사용할 수 없습니다.");
      return;
    }

    const trimmedTitle = title.trim();
    const isEditorEmpty = editorRef.current?.isEmpty() ?? true;

    if (!trimmedTitle && isEditorEmpty) {
      toast.error("임시저장하려면 제목이나 본문 중 하나는 입력해 주세요.");
      return;
    }

    setIsSavingDraft(true);

    try {
      const result = await saveCommunityDraft({
        id: draftId,
        communityId,
        category,
        title: trimmedTitle,
        contentHtml: getEditorHtml(),
      });

      setDraftId(result.id);
      // Why: 임시저장 버튼 hover에서 미리 받아둔 빈 목록이 남아 있으면
      // 저장 직후 draft 팝업을 열어도 재조회 없이 빈 상태가 유지될 수 있다.
      setHasLoadedDrafts(false);
      toast.success("임시저장했습니다.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "임시저장에 실패했습니다."
      );
    } finally {
      setIsSavingDraft(false);
    }
  }

  async function loadDraftPosts(force = false) {
    if (isDraftListLoading) return;
    if (hasLoadedDrafts && !force) return;

    setIsDraftListLoading(true);

    try {
      const nextDrafts = await fetchMyCommunityDrafts(communityId);
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
    router.push(initialPost ? `${entityHref}/${initialPost.id}` : entityHref);
  }

  function handleLoadDraft(draft: CommunityPost) {
    setDraftId(draft.id);
    setCategory(
      draft.category === "notice" && !canManageCommunityNoticeCategory
        ? "general"
        : draft.category
    );
    setTitle(draft.title);
    editorRef.current?.setHTML(draft.content_html || "");
    setIsDraftDialogOpen(false);
    toast.success("임시저장글을 불러왔습니다.");
  }

  async function handleDeleteDraft(draft: CommunityPost) {
    setDeletingDraftId(draft.id);

    try {
      await deleteCommunityDraft(draft.id, communityId);
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
    category,
    setCategory,
    drafts,
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
