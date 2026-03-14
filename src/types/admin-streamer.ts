import type { Streamer, StreamerSortOrder } from "@/types/streamer";

export type AdminStreamerSortKey = "createdAt" | "name" | "birthday" | "firstStreamDate";

export type AdminStreamerPlatformFilter = "all" | "chzzk" | "soop";

export type AdminStreamerPageParams = {
  page: number;
  pageSize: number;
  keyword: string;
  platform: AdminStreamerPlatformFilter;
  genre: string;
  sortKey: AdminStreamerSortKey;
  sortOrder: StreamerSortOrder;
};

export type AdminStreamerPageResponse = {
  data: Streamer[];
  count: number;
};
