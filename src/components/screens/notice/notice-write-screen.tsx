"use client";

import { FileText, Send } from "lucide-react";
import PostWriteSettingsBar from "@/components/common/post-write-settings-bar";
import NoticeDraftDialog from "@/components/screens/notice/notice-draft-dialog";
import RichTextEditor, {
} from "@/components/common/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNoticeWrite } from "@/hooks/notice/use-notice-write";
import type { NoticeCategory, NoticePost } from "@/types/notice";
import type { NoticeCategoryOption } from "@/types/notice-write";

const NOTICE_CATEGORY_OPTIONS: NoticeCategoryOption[] = [
  { label: "공지", value: "notice" },
  { label: "이벤트", value: "event" },
];

type NoticeWriteScreenProps = {
  initialNotice?: NoticePost | null;
};

export default function NoticeWriteScreen({
  initialNotice = null,
}: NoticeWriteScreenProps) {
  const {
    editorRef,
    title,
    setTitle,
    isPinned,
    setIsPinned,
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
  } = useNoticeWrite(initialNotice);

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {initialNotice ? "공지사항 수정" : "공지사항 글쓰기"}
        </h1>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="space-y-6">
          <PostWriteSettingsBar
            categoryId="notice-category"
            categoryValue={category}
            categoryOptions={NOTICE_CATEGORY_OPTIONS}
            onCategoryChange={(value) => setCategory(value as NoticeCategory)}
            isPinned={isPinned}
            onPinnedChange={setIsPinned}
            onClickDraftButton={initialNotice ? undefined : handleOpenDraftPosts}
            onPrefetchDraftButton={initialNotice ? undefined : handlePrefetchDraftPosts}
          />

          <div className="space-y-2">
            <Label htmlFor="notice-title">제목</Label>
            <Input
              id="notice-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="제목을 입력해 주세요"
              maxLength={80}
            />
            <p className="text-xs text-gray-500">{title.length}/80</p>
          </div>

          <RichTextEditor
            ref={editorRef}
            id="notice-content"
            initialHtml={initialNotice?.content_html || ""}
            label="본문"
            placeholder="본문을 입력해 주세요"
            previewTitle="공지사항 미리보기"
            footerActions={
              <>
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={handleCancel}
                  disabled={isSavingDraft || isPublishing}
                >
                  취소
                </Button>
                <Button
                  className="cursor-pointer"
                  onClick={handleSubmit}
                  disabled={isSavingDraft || isPublishing}
                >
                  <Send className="h-4 w-4" />
                  <span>{isPublishing ? "등록 중..." : "등록"}</span>
                </Button>
                {initialNotice ? null : (
                  <Button
                    variant="outline"
                    className="cursor-pointer"
                    onClick={handleSaveDraft}
                    disabled={isSavingDraft || isPublishing}
                  >
                    <FileText className="h-4 w-4" />
                    <span>임시저장</span>
                  </Button>
                )}
              </>
            }
          />
        </div>
      </section>

      <NoticeDraftDialog
        drafts={drafts}
        isLoading={isDraftListLoading}
        isOpen={isDraftDialogOpen}
        deletingDraftId={deletingDraftId}
        onOpenChange={setIsDraftDialogOpen}
        onSelectDraft={handleLoadDraft}
        onDeleteDraft={handleDeleteDraft}
      />
    </div>
  );
}
