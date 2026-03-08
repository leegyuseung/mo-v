export type HomeBroadcastStatus = "active" | "ended" | "deleted";

export type HomeBroadcastBase = {
  id: number;
  content: string;
  author_id: string | null;
  author_public_id: string | null;
  author_nickname: string | null;
  created_at: string;
  expires_at: string;
  deleted_at?: string | null;
  deleted_by?: string | null;
  deleted_reason?: string | null;
  status: HomeBroadcastStatus;
};

export type HomeBroadcastItem = HomeBroadcastBase;

export type HomeBroadcastListResponse = {
  data: HomeBroadcastItem[];
};

export type CreateHomeBroadcastPayload = {
  content: string;
};

export type CreateHomeBroadcastResponse = {
  id: number;
  content: string;
  author_nickname: string | null;
  created_at: string;
  after_point: number;
};

export type DeleteHomeBroadcastPayload = {
  id: number;
  reason: string;
};

export type DeleteHomeBroadcastResponse = {
  id: number;
  deleted_at: string;
  deleted_by: string;
  deleted_reason: string;
};
