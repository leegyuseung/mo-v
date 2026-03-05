import type { Content } from "@/types/content";

export type ContentsScreenProps = {
  initialContents: Content[];
  initialFavoriteContentIds?: number[];
  hasContentsError?: boolean;
  nowTimestamp: number;
};

export type ContentSortKey = "created" | "view" | "heart" | "deadline";
export type SortDirection = "asc" | "desc";
export type ContentStatusFilter = "all" | "approved" | "pending" | "ended";
export type BadgeFilter = "all" | "new" | "closing";

export type EnrichedContent = Content & {
  isNew: boolean;
  isClosingSoon: boolean;
};
