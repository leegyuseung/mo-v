import type { LiveStreamerStatus } from "@/types/live";

export type ChzzkLiveListItem = {
  channelId?: unknown;
  concurrentUserCount?: unknown;
  channelImageUrl?: unknown;
  liveImageUrl?: unknown;
  liveThumbnailImageUrl?: unknown;
  liveTitle?: unknown;
};

export type ChzzkLiveListResponse = {
  content?: {
    data?: unknown;
    page?: {
      next?: unknown;
    };
  };
  data?: unknown;
  page?: {
    next?: unknown;
  };
};

export type SoopBroadListItem = {
  broadNo?: unknown;
  broad_no?: unknown;
  broadThumb?: unknown;
  broad_thumb?: unknown;
  broadTitle?: unknown;
  broad_title?: unknown;
  totalViewCnt?: unknown;
  total_view_cnt?: unknown;
  userId?: unknown;
  user_id?: unknown;
};

export type SoopBroadListResponse = {
  broad?: unknown;
  page_block?: unknown;
  total_cnt?: unknown;
};

export type OfficialLivePlatform = "chzzk" | "soop";

export type PlatformLiveCacheEntry = {
  data: Map<string, LiveStreamerStatus>;
  updatedAt: number;
};
