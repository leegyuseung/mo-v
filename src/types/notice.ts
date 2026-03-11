export type NoticeCategory = "notice" | "event";
export type NoticeStatus = "draft" | "published" | "deleted";

export type NoticePost = {
  id: number;
  author_id: string;
  category: NoticeCategory;
  title: string;
  content_html: string;
  content_json: unknown | null;
  is_pinned: boolean;
  status: NoticeStatus;
  view_count: number;
  like_count: number;
  dislike_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  deleted_at: string | null;
  deleted_by: string | null;
};

export type NoticeSavePayload = {
  id?: number;
  category?: NoticeCategory;
  title: string;
  contentHtml: string;
  isPinned: boolean;
  status: Extract<NoticeStatus, "draft" | "published">;
};

export type NoticeSaveResponse = {
  id: number;
  status: Extract<NoticeStatus, "draft" | "published">;
  message?: string;
};

export type NoticeListResponse = {
  items: NoticePost[];
  message?: string;
};

export type NoticeDraftListResponse = {
  items: NoticePost[];
  message?: string;
};
