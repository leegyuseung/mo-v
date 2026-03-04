export type HomeBroadcastItem = {
  id: number;
  content: string;
  author_id: string | null;
  author_public_id: string | null;
  author_nickname: string | null;
  created_at: string;
  expires_at: string;
  status: "active" | "ended";
};

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
