import type { MouseEvent } from "react";
import type { ContentStatus } from "@/types/content";
import type {
  ContentSortKey,
  ContentStatusFilter,
  EnrichedContent,
  ParticipantCompositionFilter,
} from "@/types/contents-screen";

export type ContentsScreenFilterPanelProps = {
  searchKeyword: string;
  onChangeSearchKeyword: (keyword: string) => void;
  canCreateContent: boolean;
  onClickCreateContent: () => void;
  badgeFilter: "all" | "new" | "closing";
  onChangeBadgeFilter: (filter: "all" | "new" | "closing") => void;
  selectedContentTypes: string[];
  onResetContentTypeFilter: () => void;
  onToggleContentType: (type: string) => void;
  sortKey: ContentSortKey;
  onClickSortButton: (sortKey: ContentSortKey) => void;
  participantCompositionFilter: ParticipantCompositionFilter;
  onChangeParticipantCompositionFilter: (filter: ParticipantCompositionFilter) => void;
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
  onClickToggleFavorite: (
    event: MouseEvent<HTMLButtonElement>,
    contentId: number,
    contentStatus: ContentStatus
  ) => Promise<void>;
};
