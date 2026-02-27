import type { Content } from "@/types/content";

export type ContentsScreenProps = {
  initialContents: Content[];
  initialFavoriteContentIds?: number[];
  hasContentsError?: boolean;
  nowTimestamp: number;
};

export type ContentSortKey = "created" | "view" | "heart" | "title" | "deadline";
export type SortDirection = "asc" | "desc";
export type ParticipantCompositionFilter = "all" | "버츄얼만" | "버츄얼포함";
export type ContentStatusFilter = "all" | "approved" | "pending" | "ended";
export type BadgeFilter = "all" | "new" | "closing";

export type EnrichedContent = Content & {
  isNew: boolean;
  isClosingSoon: boolean;
};
