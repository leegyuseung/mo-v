import type { NoticeCategory, NoticePost } from "@/types/notice";

export type NoticeCategoryOption = {
  label: string;
  value: NoticeCategory;
};

export type NoticeDraftDialogProps = {
  drafts: NoticePost[];
  isLoading: boolean;
  isOpen: boolean;
  deletingDraftId: number | null;
  onOpenChange: (open: boolean) => void;
  onSelectDraft: (draft: NoticePost) => void;
  onDeleteDraft: (draft: NoticePost) => void;
};
