import { Tables } from "@/types/database.types";

export type Streamer = Tables<"streamers">;

export type StreamerPlatform = "all" | "chzzk" | "soop";
export type StreamerSortOrder = "asc" | "desc";
export type StreamerSortBy = "name" | "heart" | "star";
export type StreamerRequestPlatform = Exclude<StreamerPlatform, "all">;

export type StreamerListParams = {
  page: number;
  pageSize: number;
  platform: StreamerPlatform;
  sortBy: StreamerSortBy;
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

export type CreateStreamerInfoEditRequestInput = {
  content: string;
  streamerId: number;
  streamerNickname: string;
  requesterId: string;
  requesterNickname: string | null;
};

/** 버츄얼 상세 화면 컴포넌트에 전달하는 props */
export type VlistDetailScreenProps = {
  streamerPublicId: string;
};
