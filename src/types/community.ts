export type CommunitySearchEntityType = "vlist" | "group" | "crew";
export type CommunityCategory =
  | "notice"
  | "general"
  | "info_schedule"
  | "broadcast_review"
  | "broadcast_summary";
export type CommunityPostStatus = "draft" | "published" | "suspended" | "deleted";

export type CommunityPostSearchField = "title_content" | "title" | "content";

export type CommunitySearchItem = {
  id: string;
  type: CommunitySearchEntityType;
  name: string;
  href: string;
  imageUrl: string | null;
};

export type CommunityShortcutItem = {
  id: string;
  type: CommunitySearchEntityType;
  name: string;
  href: string;
  imageUrl: string | null;
};

export type CommunityHubPostItem = {
  id: number;
  title: string;
  href: string;
  category: CommunityCategory;
  communityType: CommunitySearchEntityType;
  communityName: string;
  communityHref: string;
  likeCount: number;
  viewCount: number;
  createdAt: string;
  publishedAt: string | null;
  score?: number;
};

export type CommunityDirectoryItem = {
  id: string;
  type: CommunitySearchEntityType;
  name: string;
  href: string;
  imageUrl: string | null;
  isStarred: boolean;
  latestPostAt: string | null;
  recentPostCount24h: number;
  platform?: string | null;
  genres?: string[];
  memberImages?: Array<{
    id: number;
    imageUrl: string | null;
    name: string;
  }>;
  memberCount?: number;
};

export type CommunityBoardMeta = {
  communityId: number | null;
  entityType: CommunitySearchEntityType;
  entityId: number;
  entityName: string;
  entityPublicId: string;
  imageUrl: string | null;
};

export type CommunityBoardAuthorProfile = {
  nickname: string | null;
  avatar_url: string | null;
  public_id: string | null;
};

export type CommunityPost = {
  id: number;
  community_id: number;
  author_id: string;
  category: CommunityCategory;
  title: string;
  content_html: string;
  content_json: unknown | null;
  status: CommunityPostStatus;
  is_pinned: boolean;
  view_count: number;
  like_count: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  deleted_at?: string | null;
  deleted_by?: string | null;
  author_profile: CommunityBoardAuthorProfile | null;
};

export type CommunityLikeResponse = {
  liked?: boolean;
  like_count?: number;
  message?: string;
};

export type CommunityTrackViewResponse = {
  incremented?: boolean;
  view_count?: number;
  message?: string;
};

export type CommunityBoardPost = Pick<
  CommunityPost,
  | "id"
  | "community_id"
  | "author_id"
  | "category"
  | "title"
  | "status"
  | "is_pinned"
  | "view_count"
  | "like_count"
  | "comment_count"
  | "created_at"
  | "published_at"
  | "author_profile"
>;

export type CommunityBoardListResult = {
  items: CommunityBoardPost[];
  totalCount: number;
};

export type CommunitySavePayload = {
  id?: number;
  communityId: number;
  category: CommunityCategory;
  title: string;
  contentHtml: string;
  status: Extract<CommunityPostStatus, "draft" | "published">;
};

export type CommunitySaveResponse = {
  id: number;
  status: Extract<CommunityPostStatus, "draft" | "published">;
  message?: string;
};

export type CommunityDraftListResponse = {
  items: CommunityPost[];
  message?: string;
};
