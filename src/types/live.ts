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

// ─── Route Handler 내부 캐시/DB 타입 ──────────────────────────────

/** 인메모리 라이브 데이터 캐시 엔트리 */
export type LiveCacheEntry = {
  data: LiveStreamer[];
  updatedAt: number;
};

export type LiveCacheKey = "all" | "liveOnly";

/** Supabase streamers 테이블에서 라이브 매칭에 필요한 컬럼만 선별한 행 타입 */
export type StreamerRow = {
  id: number;
  public_id: string | null;
  nickname: string | null;
  image_url: string | null;
  platform: string | null;
  group_name: string[] | null;
  crew_name: string[] | null;
  genre: string[] | null;
  chzzk_id: string | null;
  soop_id: string | null;
};

/** 스트리머 메타데이터 인메모리 캐시 엔트리 */
export type StreamerMetadataCacheEntry = {
  rows: StreamerRow[];
  updatedAt: number;
};
