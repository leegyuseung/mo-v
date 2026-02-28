import type { Streamer } from "@/types/streamer";

export type PlatformLiveStatus = {
  isLive: boolean;
  viewerCount: number | null;
  liveTitle: string | null;
  liveThumbnailImageUrl: string | null;
  liveUrl: string;
};

export type LiveStreamer = Streamer & PlatformLiveStatus;

export type LiveStreamerStatus = {
  isLive: boolean;
  viewerCount: number | null;
  liveTitle: string | null;
  liveThumbnailImageUrl: string | null;
  liveUrl: string | null;
};

export type LiveStatusByStreamerId = Record<number, LiveStreamerStatus>;

/** 라이브 목록의 정렬 방식 */
export type LiveSortOrder = "name_asc" | "name_desc" | "viewer_desc" | "viewer_asc";
