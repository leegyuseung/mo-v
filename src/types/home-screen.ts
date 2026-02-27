import type { HomeShowcaseData, HomeShowcaseStreamer } from "@/types/home";
import type { StreamerHeartLeaderboardItem } from "@/types/heart";
import type { LiveBox } from "@/types/live-box";
import type { LiveStreamer } from "@/types/live";

export type HomeRankCard = {
  key: string;
  title: string;
  data: StreamerHeartLeaderboardItem[];
  isLoading: boolean;
  isError?: boolean;
};

export type HomeHeartRankSectionProps = {
  rankCards: HomeRankCard[];
};

export type HomeShowcaseSectionProps = {
  showcaseData: HomeShowcaseData | undefined;
  isShowcaseLoading: boolean;
  isShowcaseError: boolean;
};

export type HomeLiveStarSectionProps = {
  isLiveLoading: boolean;
  topLiveStreamers: LiveStreamer[];
  isLoggedIn: boolean;
  starredStreamerIds: number[];
  liveFavoriteStreamers: LiveStreamer[];
};

export type HomeLiveBoxSectionProps = {
  isLiveBoxLoading: boolean;
  isLiveBoxError: boolean;
  topLiveBoxes: LiveBox[];
};

export type ShowcaseStreamerListProps = {
  streamers: HomeShowcaseStreamer[];
  emptyText: string;
  showBirthdayMeta?: boolean;
  enableScrollWhenMany?: boolean;
};
