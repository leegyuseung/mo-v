export type NoticeCategory = "notice" | "event";
export type NoticeStatus = "draft" | "published" | "deleted";

export type NoticeAuthorProfile = {
  nickname: string | null;
  avatar_url: string | null;
  public_id: string | null;
};

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
  author_profile?: NoticeAuthorProfile | null;
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

export type NoticeDraftListResponse = {
  items: NoticePost[];
  message?: string;
};

export type NoticeTrackViewResponse = {
  incremented?: boolean;
  view_count?: number;
  message?: string;
};

export type NoticeLikeResponse = {
  liked: boolean;
  like_count: number;
  message?: string;
};

export type NoticeSearchField = "title_content" | "title" | "content";

export type NoticeListQuery = {
  page?: number;
  pageSize?: number;
  category?: NoticeCategory;
  searchField?: NoticeSearchField;
  keyword?: string;
};

export type NoticeListResult = {
  items: NoticePost[];
  totalCount: number;
};
