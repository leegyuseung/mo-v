import type { HomeShowcaseData, HomeShowcaseStreamer } from "@/types/home";
import type { HeartRankPeriod, StreamerHeartLeaderboardItem } from "@/types/heart";
import type { LiveBox } from "@/types/live-box";
import type { LiveStatusByStreamerId, LiveStreamer } from "@/types/live";

export type HomeRankCard = {
  key: HeartRankPeriod;
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
  liveStatusById: LiveStatusByStreamerId;
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
  showLiveMeta?: boolean;
  liveStatusById?: LiveStatusByStreamerId;
};
