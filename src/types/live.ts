import type { Streamer } from "@/types/streamer";

export type PlatformLiveStatus = {
  isLive: boolean;
  viewerCount: number | null;
  liveTitle: string | null;
  liveThumbnailImageUrl: string | null;
  liveUrl: string;
};

export type LiveStreamer = Streamer & PlatformLiveStatus;
