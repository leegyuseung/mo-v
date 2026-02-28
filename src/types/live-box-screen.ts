import type { LiveStreamer } from "@/types/live";
import type { LiveBox, LiveBoxParticipantProfile } from "@/types/live-box";

export type LiveBoxStatusFilter = "all" | "ongoing" | "pending" | "closed";

export type LiveBoxSortKey = "created" | "title" | "participants";

export type LiveBoxSortDirection = "asc" | "desc";

export type LiveBoxParticipantPreview = {
  platformId: string;
  nickname: string | null;
  imageUrl: string | null;
};

export type LiveBoxParticipantPreviewByPlatformId = Map<
  string,
  LiveBoxParticipantPreview
>;

export type LiveBoxScreenProps = {
  initialLiveBoxes: LiveBox[];
  initialParticipantProfiles: LiveBoxParticipantProfile[];
  hasLiveBoxesError?: boolean;
  hasParticipantProfilesError?: boolean;
};

export type LiveBoxDetailScreenProps = {
  liveBox: LiveBox | null;
  participantProfiles: LiveBoxParticipantProfile[];
  liveStreamers: LiveStreamer[];
  hasLiveBoxError?: boolean;
  hasParticipantProfilesError?: boolean;
  hasLiveStreamersError?: boolean;
};

export type LiveBoxListCardProps = {
  box: LiveBox;
  participantByPlatformId: LiveBoxParticipantPreviewByPlatformId;
  brokenParticipantImageById: Record<string, boolean>;
  onParticipantImageError: (platformId: string) => void;
};

export type LiveBoxFilterControlsProps = {
  keyword: string;
  totalCount: number;
  statusFilter: LiveBoxStatusFilter;
  sortKey: LiveBoxSortKey;
  hasUser: boolean;
  onKeywordChange: (value: string) => void;
  onSelectStatusFilter: (value: LiveBoxStatusFilter) => void;
  onClickSortButton: (value: LiveBoxSortKey) => void;
};

export type LiveBoxDetailParticipantProfileLookup = Map<
  string,
  {
    nickname: string | null;
    imageUrl: string | null;
    platform: "chzzk" | "soop";
  }
>;

export type LiveBoxDetailLiveLookup = Map<
  string,
  {
    liveUrl: string;
    viewerCount: number | null;
  }
>;

export type LiveBoxParticipantsPanelProps = {
  liveBox: LiveBox;
  filteredParticipantIds: string[];
  participantByPlatformId: LiveBoxDetailParticipantProfileLookup;
  liveByPlatformId: LiveBoxDetailLiveLookup;
};
