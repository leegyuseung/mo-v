import type { CommunityCategory, CommunityPost } from "@/types/community";

export type CommunityCategoryOption = {
  label: string;
  value: CommunityCategory;
};

export type CommunityDraftDialogProps = {
  drafts: CommunityPost[];
  isLoading: boolean;
  isOpen: boolean;
  deletingDraftId: number | null;
  onOpenChange: (open: boolean) => void;
  onSelectDraft: (draft: CommunityPost) => void;
  onDeleteDraft: (draft: CommunityPost) => void;
};
