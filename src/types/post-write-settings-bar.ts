export type PostWriteCategoryOption = {
  label: string;
  value: string;
};

export type PostWriteSettingsBarProps = {
  categoryId?: string;
  categoryLabel?: string;
  categoryValue: string;
  categoryOptions: PostWriteCategoryOption[];
  onCategoryChange: (value: string) => void;
  isPinned: boolean;
  onPinnedChange: (checked: boolean) => void;
  pinTitle?: string;
  pinDescription?: string;
  draftButtonLabel?: string;
  onClickDraftButton?: () => void;
  onPrefetchDraftButton?: () => void;
  draftButtonDisabled?: boolean;
};
