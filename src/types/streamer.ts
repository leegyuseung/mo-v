import { Tables } from "@/types/database.types";

export type Streamer = Tables<"streamers">;

export type StreamerPlatform = "all" | "chzzk" | "soop";
export type StreamerSortOrder = "asc" | "desc";
export type StreamerRequestPlatform = Exclude<StreamerPlatform, "all">;

export type StreamerListParams = {
  page: number;
  pageSize: number;
  platform: StreamerPlatform;
  sortOrder: StreamerSortOrder;
  keyword: string;
};

export type StreamerListResponse = {
  data: Streamer[];
  count: number;
};

export type CreateStreamerRequestInput = {
  requesterId: string;
  platform: StreamerRequestPlatform;
  platformStreamerId: string;
  platformStreamerUrl: string;
};
