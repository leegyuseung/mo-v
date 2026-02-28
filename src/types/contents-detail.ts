import type { ContentStatus } from "@/types/content";

export type ContentsDetailActionBarProps = {
  authorId: string | null;
  contentId: number;
  contentTitle: string;
  contentStatus: ContentStatus;
  initialViewCount: number;
  initialIsLiked: boolean;
};

export type ContentsEarlyEndButtonProps = {
  contentId: number;
  authorId: string | null;
  status: ContentStatus;
};

export type ScheduleCalendarProps = {
  label: string;
  start: string | null;
  end: string | null;
  tone: "blue" | "green";
};

export type ScheduleHoverCardProps = {
  label: string;
  start: string | null;
  end: string | null;
  tone: "blue" | "green";
};

export type TrackContentViewResponse = {
  incremented?: boolean;
  view_count?: number;
  message?: string;
};

export type ToggleContentFavoriteResponse = {
  liked?: boolean;
  favorite_count?: number;
  message?: string;
};

export type EarlyEndContentResponse = {
  id?: number;
  status?: ContentStatus;
  message?: string;
};

export type FavoriteContentIdsResponse = {
  favoriteContentIds?: number[];
  message?: string;
};

export type ContentDetailItem = {
  label: string;
  value: string;
};

export type ContentsDetailSummarySectionProps = {
  title: string;
  status: ContentStatus;
  nowTimestamp: number;
  participantComposition: string;
  recruitmentStartAt: string | null;
  recruitmentEndAt: string | null;
  contentStartAt: string | null;
  contentEndAt: string | null;
  applicationUrl: string;
  contentId: number;
  authorId: string | null;
  contentTypes: string[];
  isNew: boolean;
  isClosingSoon: boolean;
};

export type ContentsDetailInfoSectionProps = {
  detailItems: ContentDetailItem[];
  participationRequirement: string | null;
  description: string | null;
};

export type UseContentsDetailActionsParams = ContentsDetailActionBarProps;

export type UseContentsDetailActionsResult = {
  viewCount: number;
  isLiked: boolean;
  isEnded: boolean;
  isReportModalOpen: boolean;
  isEditRequestModalOpen: boolean;
  isFavoritePending: boolean;
  isInfoEditSubmitting: boolean;
  isReportSubmitting: boolean;
  isAuthor: boolean;
  userId: string | null;
  openInfoEditRequestModal: () => void;
  openReportModal: () => void;
  onClickToggleFavorite: () => Promise<void>;
  onCloseInfoEditModal: () => void;
  onCloseReportModal: () => void;
  handleSubmitReport: (content: string) => Promise<void>;
  handleSubmitInfoEditRequest: (content: string) => Promise<void>;
};
