import type { MouseEvent } from "react";
import type { ContentStatus } from "@/types/content";
import type {
  BadgeFilter,
  ContentSortKey,
  ContentStatusFilter,
  EnrichedContent,
} from "@/types/contents-screen";

export type ContentsScreenFilterPanelProps = {
  searchKeyword: string;
  onChangeSearchKeyword: (keyword: string) => void;
  canCreateContent: boolean;
  onClickCreateContent: () => void;
  badgeFilter: BadgeFilter;
  onChangeBadgeFilter: (filter: BadgeFilter) => void;
  selectedContentTypes: string[];
  onResetContentTypeFilter: () => void;
  onToggleContentType: (type: string) => void;
  sortKey: ContentSortKey;
  onClickSortButton: (sortKey: ContentSortKey) => void;
  statusFilter: ContentStatusFilter;
  onChangeStatusFilter: (filter: ContentStatusFilter) => void;
  totalCount: number;
};

export type ContentListItemCardProps = {
  content: EnrichedContent;
  favoriteCount: number;
  isLiked: boolean;
  isFavoriteDisabled: boolean;
  canToggleFavorite: boolean;
  nowTimestamp: number;
  onClickToggleFavorite: (
    event: MouseEvent<HTMLButtonElement>,
    contentId: number,
    contentStatus: ContentStatus
  ) => Promise<void>;
};
