"use client";

import { FileText, Send } from "lucide-react";
import PostWriteSettingsBar from "@/components/common/post-write-settings-bar";
import RichTextEditor from "@/components/common/rich-text-editor";
import CommunityDraftDialog from "@/components/screens/community/community-draft-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCommunityWrite } from "@/hooks/community/use-community-write";
import type {
  CommunityCategory,
  CommunityPost,
  CommunitySearchEntityType,
} from "@/types/community";
import type { CommunityCategoryOption } from "@/types/community-write";

type CommunityWriteScreenProps = {
  entityType: CommunitySearchEntityType;
  entityName: string;
  entityHref: string;
  communityId: number;
  canManageCommunityNoticeCategory: boolean;
  initialPost?: CommunityPost | null;
};

const BASE_CATEGORY_OPTIONS: CommunityCategoryOption[] = [
  { label: "일반", value: "general" },
  { label: "정보/일정", value: "info_schedule" },
  { label: "방송후기", value: "broadcast_review" },
  { label: "방송정리", value: "broadcast_summary" },
];

export default function CommunityWriteScreen({
  entityType,
  entityName,
  entityHref,
  communityId,
  canManageCommunityNoticeCategory,
  initialPost = null,
}: CommunityWriteScreenProps) {
  const {
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
  } = useCommunityWrite({
    initialPost,
    entityName,
    entityHref,
    communityId,
    canManageCommunityNoticeCategory,
  });

  const typeLabel =
    entityType === "vlist" ? "버츄얼" : entityType === "group" ? "그룹" : "소속";
  const categoryOptions = canManageCommunityNoticeCategory
    ? ([{ label: "공지", value: "notice" }, ...BASE_CATEGORY_OPTIONS] satisfies CommunityCategoryOption[])
    : BASE_CATEGORY_OPTIONS;

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {initialPost
            ? `${entityName} ${typeLabel} 커뮤니티 글 수정`
            : `${entityName} ${typeLabel} 커뮤니티 글쓰기`}
        </h1>
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="space-y-6">
          <PostWriteSettingsBar
            categoryId="community-category"
            categoryValue={category}
            categoryOptions={categoryOptions}
            onCategoryChange={(value) => setCategory(value as CommunityCategory)}
            isPinned={category === "notice" && canManageCommunityNoticeCategory}
            onPinnedChange={() => {}}
            showPinSection={false}
            draftButtonLabel="임시저장글"
            onClickDraftButton={initialPost ? undefined : handleOpenDraftPosts}
            onPrefetchDraftButton={initialPost ? undefined : handlePrefetchDraftPosts}
          />

          <div className="space-y-2">
            <Label htmlFor="community-post-title">제목</Label>
            <Input
              id="community-post-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="제목을 입력해 주세요"
              maxLength={120}
            />
            <p className="text-xs text-gray-500">{title.length}/120</p>
          </div>

          <RichTextEditor
            ref={editorRef}
            id="community-post-content"
            initialHtml={initialPost?.content_html || ""}
            label="본문"
            placeholder="본문을 입력해 주세요"
            previewTitle={`${entityName} 커뮤니티 글 미리보기`}
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
                {initialPost ? null : (
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

      <CommunityDraftDialog
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
