import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import {
  fetchMyStarredCrewIdsOnServer,
  fetchMyStarredGroupIdsOnServer,
  fetchMyStarredStreamerIdsOnServer,
} from "@/api/star-server";
import type {
  CommunityCategory,
  CommunityBoardListResult,
  CommunityBoardMeta,
  CommunityBoardPost,
  CommunityPost,
  CommunityPostSearchField,
  CommunityDirectoryItem,
  CommunityHubPostItem,
  CommunityShortcutItem,
} from "@/types/community";
import { canManageCommunityNoticeCategory } from "@/utils/community-permission";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * 커뮤니티 허브에서 로그인 사용자의 즐겨찾기 바로가기를 만든다.
 * 왜: 이미 즐겨찾기한 엔티티는 검색보다 바로 접근하는 동선이 더 빠르기 때문이다.
 */
export async function fetchMyCommunityShortcutsOnServer(): Promise<
  CommunityShortcutItem[]
> {
  const [starredStreamerIds, starredGroupIds, starredCrewIds] = await Promise.all([
    fetchMyStarredStreamerIdsOnServer(),
    fetchMyStarredGroupIdsOnServer(),
    fetchMyStarredCrewIdsOnServer(),
  ]);

  if (
    starredStreamerIds.length === 0 &&
    starredGroupIds.length === 0 &&
    starredCrewIds.length === 0
  ) {
    return [];
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const [streamersResult, groupsResult, crewsResult] = await Promise.all([
    starredStreamerIds.length > 0
      ? supabase
          .from("streamers")
          .select("id,public_id,nickname,image_url")
          .in("id", starredStreamerIds)
      : Promise.resolve({ data: [], error: null }),
    starredGroupIds.length > 0
      ? supabase
          .from("idol_groups")
          .select("id,group_code,name,image_url")
          .in("id", starredGroupIds)
      : Promise.resolve({ data: [], error: null }),
    starredCrewIds.length > 0
      ? supabase
          .from("crews")
          .select("id,crew_code,name,image_url")
          .in("id", starredCrewIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (streamersResult.error || groupsResult.error || crewsResult.error) {
    return [];
  }

  const streamerOrder = new Map(starredStreamerIds.map((id, index) => [id, index]));
  const groupOrder = new Map(starredGroupIds.map((id, index) => [id, index]));
  const crewOrder = new Map(starredCrewIds.map((id, index) => [id, index]));

  const streamerItems: CommunityShortcutItem[] = (streamersResult.data || [])
    .filter((streamer) => Boolean(streamer.public_id))
    .sort((a, b) => (streamerOrder.get(a.id) ?? 0) - (streamerOrder.get(b.id) ?? 0))
    .map((streamer) => ({
      id: `shortcut-vlist-${streamer.id}`,
      type: "vlist",
      name: streamer.nickname || `버츄얼 ${streamer.id}`,
      href: `/community/vlist/${streamer.public_id}`,
      imageUrl: streamer.image_url || null,
    }));

  const groupItems: CommunityShortcutItem[] = (groupsResult.data || [])
    .sort((a, b) => (groupOrder.get(a.id) ?? 0) - (groupOrder.get(b.id) ?? 0))
    .map((group) => ({
      id: `shortcut-group-${group.id}`,
      type: "group",
      name: group.name,
      href: `/community/group/${group.group_code}`,
      imageUrl: group.image_url || null,
    }));

  const crewItems: CommunityShortcutItem[] = (crewsResult.data || [])
    .sort((a, b) => (crewOrder.get(a.id) ?? 0) - (crewOrder.get(b.id) ?? 0))
    .map((crew) => ({
      id: `shortcut-crew-${crew.id}`,
      type: "crew",
      name: crew.name,
      href: `/community/crew/${crew.crew_code}`,
      imageUrl: crew.image_url || null,
    }));

  return [...streamerItems, ...groupItems, ...crewItems];
}

export async function fetchCommunityAuthUserOnServer(): Promise<User | null> {
  const { user } = await fetchCommunityAuthContext();
  return user;
}

export async function canWriteCommunityOnServer() {
  const user = await fetchCommunityAuthUserOnServer();
  return Boolean(user);
}

export function isCommunityServerConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey && serviceRoleKey);
}

export function createCommunityAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createAdminClient(supabaseUrl, serviceRoleKey);
}

export function createCommunityRequestClient(
  cookieStore: Awaited<ReturnType<typeof cookies>>
) {
  return createClient(cookieStore);
}

export async function fetchCommunityAuthContext(): Promise<{
  supabase: ReturnType<typeof createClient>;
  user: User | null;
  role: string | null;
  canManageCommunityNoticeCategory: boolean;
  userError: Error | null;
}> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      supabase,
      user: null,
      role: null,
      canManageCommunityNoticeCategory: false,
      userError: userError ?? new Error("로그인이 필요합니다."),
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = profile?.role ?? null;

  return {
    supabase,
    user,
    role,
    canManageCommunityNoticeCategory: canManageCommunityNoticeCategory(role),
    userError: null,
  };
}

function createCommunityReadClient() {
  return createCommunityAdminClient();
}

async function fetchCommunityPostIdsByKeyword({
  supabase,
  communityId,
  keyword,
  searchField,
}: {
  supabase: NonNullable<ReturnType<typeof createCommunityAdminClient>>;
  communityId: number;
  keyword: string;
  searchField: CommunityPostSearchField;
}) {
  const matchedIds = new Set<number>();
  const likeKeyword = `%${keyword.replace(/[%_]/g, "\\$&")}%`;

  // Why: PostgREST .or(...) 문자열 결합은 특수문자가 섞인 검색어에 취약하므로
  // title/content를 분리 조회해 id 집합을 합치는 쪽이 더 안전하다.
  const queries =
    searchField === "title_content"
      ? [
          supabase
            .from("community_posts")
            .select("id")
            .eq("community_id", communityId)
            .eq("status", "published")
            .is("deleted_at", null)
            .ilike("title", likeKeyword),
          supabase
            .from("community_posts")
            .select("id")
            .eq("community_id", communityId)
            .eq("status", "published")
            .is("deleted_at", null)
            .ilike("content_html", likeKeyword),
        ]
      : [
          supabase
            .from("community_posts")
            .select("id")
            .eq("community_id", communityId)
            .eq("status", "published")
            .is("deleted_at", null)
            .ilike(searchField === "title" ? "title" : "content_html", likeKeyword),
        ];

  const results = await Promise.all(queries);
  for (const result of results) {
    if (result.error) {
      return null;
    }

    (result.data || []).forEach((row) => {
      if (typeof row.id === "number") {
        matchedIds.add(row.id);
      }
    });
  }

  return [...matchedIds];
}

type CommunityPostBaseRow = {
  id: number;
  title: string;
  community_id: number;
  category: CommunityCategory;
  like_count: number | null;
  view_count: number | null;
  created_at: string;
  published_at: string | null;
};

type CommunityRow = {
  id: number;
  community_type: "vlist" | "group" | "crew";
  streamer_id: number | null;
  group_id: number | null;
  crew_id: number | null;
};

async function buildCommunityHubPostItems(
  supabase: ReturnType<typeof createClient>,
  rows: Array<CommunityPostBaseRow & { score?: number }>
): Promise<CommunityHubPostItem[]> {
  if (rows.length === 0) {
    return [];
  }

  const communityIds = [...new Set(rows.map((row) => row.community_id))];
  const { data: communitiesData, error: communitiesError } = await supabase
    .from("communities")
    .select("id,community_type,streamer_id,group_id,crew_id")
    .in("id", communityIds);

  if (communitiesError || !communitiesData) {
    return [];
  }

  const communities = communitiesData as CommunityRow[];
  const streamerIds = communities
    .map((row) => row.streamer_id)
    .filter((id): id is number => typeof id === "number");
  const groupIds = communities
    .map((row) => row.group_id)
    .filter((id): id is number => typeof id === "number");
  const crewIds = communities
    .map((row) => row.crew_id)
    .filter((id): id is number => typeof id === "number");

  const [streamersResult, groupsResult, crewsResult] = await Promise.all([
    streamerIds.length > 0
      ? supabase
          .from("streamers")
          .select("id,public_id,nickname")
          .in("id", streamerIds)
      : Promise.resolve({ data: [], error: null }),
    groupIds.length > 0
      ? supabase
          .from("idol_groups")
          .select("id,group_code,name")
          .in("id", groupIds)
      : Promise.resolve({ data: [], error: null }),
    crewIds.length > 0
      ? supabase
          .from("crews")
          .select("id,crew_code,name")
          .in("id", crewIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (streamersResult.error || groupsResult.error || crewsResult.error) {
    return [];
  }

  const streamerById = new Map(
    (streamersResult.data || [])
      .filter((row) => Boolean(row.public_id))
      .map((row) => [
      row.id,
      {
        name: row.nickname || `버츄얼 ${row.id}`,
        href: `/community/vlist/${row.public_id}`,
      },
    ])
  );
  const groupById = new Map(
    (groupsResult.data || []).map((row) => [
      row.id,
      {
        name: row.name,
        href: `/community/group/${row.group_code}`,
      },
    ])
  );
  const crewById = new Map(
    (crewsResult.data || []).map((row) => [
      row.id,
      {
        name: row.name,
        href: `/community/crew/${row.crew_code}`,
      },
    ])
  );
  const communityById = new Map(communities.map((row) => [row.id, row]));
  const items: CommunityHubPostItem[] = [];

  rows.forEach((row) => {
    const community = communityById.get(row.community_id);
    if (!community) return;

    if (community.community_type === "vlist" && community.streamer_id) {
      const target = streamerById.get(community.streamer_id);
      if (!target) return;

      items.push({
        id: row.id,
        title: row.title,
        href: `${target.href}/${row.id}`,
        category: row.category,
        communityType: "vlist",
        communityName: target.name,
        communityHref: target.href,
        likeCount: row.like_count || 0,
        viewCount: row.view_count || 0,
        createdAt: row.created_at,
        publishedAt: row.published_at,
        score: row.score,
      });
      return;
    }

    if (community.community_type === "group" && community.group_id) {
      const target = groupById.get(community.group_id);
      if (!target) return;

      items.push({
        id: row.id,
        title: row.title,
        href: `${target.href}/${row.id}`,
        category: row.category,
        communityType: "group",
        communityName: target.name,
        communityHref: target.href,
        likeCount: row.like_count || 0,
        viewCount: row.view_count || 0,
        createdAt: row.created_at,
        publishedAt: row.published_at,
        score: row.score,
      });
      return;
    }

    if (community.community_type === "crew" && community.crew_id) {
      const target = crewById.get(community.crew_id);
      if (!target) return;

      items.push({
        id: row.id,
        title: row.title,
        href: `${target.href}/${row.id}`,
        category: row.category,
        communityType: "crew",
        communityName: target.name,
        communityHref: target.href,
        likeCount: row.like_count || 0,
        viewCount: row.view_count || 0,
        createdAt: row.created_at,
        publishedAt: row.published_at,
        score: row.score,
      });
    }
  });

  return items;
}

export async function fetchTrendingCommunityPostsOnServer(): Promise<
  CommunityHubPostItem[]
> {
  try {
    const supabase = createCommunityReadClient();
    if (!supabase) {
      return [];
    }
    const bucketStart = new Date();
    bucketStart.setMinutes(0, 0, 0);
    bucketStart.setHours(bucketStart.getHours() - 1);

    const { data: statRows, error: statError } = await supabase
      .from("community_post_hourly_stats")
      .select("post_id,view_count")
      .gte("bucket_started_at", bucketStart.toISOString());

    // hourly_stats가 없거나 비어있으면 전체 view_count 기준 fallback
    if (statError || !statRows || statRows.length === 0) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("community_posts")
        .select("id,title,community_id,category,like_count,view_count,created_at,published_at")
        .eq("status", "published")
        .gt("view_count", 0)
        .gte("created_at", since)
        .order("view_count", { ascending: false })
        .limit(10);

      if (fallbackError || !fallbackData || fallbackData.length === 0) {
        return [];
      }

      return buildCommunityHubPostItems(supabase, fallbackData as CommunityPostBaseRow[]);
    }

    const scoreByPostId = new Map<number, number>();
    statRows.forEach((row) => {
      if (typeof row.post_id !== "number") return;
      scoreByPostId.set(
        row.post_id,
        (scoreByPostId.get(row.post_id) || 0) + (row.view_count || 0)
      );
    });

    const rankedPostIds = [...scoreByPostId.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([postId]) => postId);

    if (rankedPostIds.length === 0) {
      return [];
    }

    const { data: postsData, error: postsError } = await supabase
      .from("community_posts")
      .select("id,title,community_id,category,like_count,view_count,created_at,published_at")
      .in("id", rankedPostIds)
      .eq("status", "published");

    if (postsError || !postsData) {
      return [];
    }

    const order = new Map(rankedPostIds.map((id, index) => [id, index]));
    const orderedRows = (postsData as CommunityPostBaseRow[])
      .map((row) => ({
        ...row,
        score: scoreByPostId.get(row.id) || 0,
      }))
      .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));

    return buildCommunityHubPostItems(supabase, orderedRows);
  } catch {
    return [];
  }
}

export async function fetchPopularCommunityPostsOnServer(): Promise<
  CommunityHubPostItem[]
> {
  try {
    const supabase = createCommunityReadClient();
    if (!supabase) {
      return [];
    }
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("community_posts")
      .select("id,title,community_id,category,like_count,view_count,created_at,published_at")
      .eq("status", "published")
      .gte("published_at", since)
      .order("like_count", { ascending: false })
      .order("view_count", { ascending: false })
      .order("published_at", { ascending: false })
      .limit(10);

    if (error || !data) {
      return [];
    }

    return buildCommunityHubPostItems(supabase, data as CommunityPostBaseRow[]);
  } catch {
    return [];
  }
}

export async function fetchFavoriteLatestCommunityPostsOnServer(): Promise<
  CommunityHubPostItem[]
> {
  try {
    const [starredStreamerIds, starredGroupIds, starredCrewIds] = await Promise.all([
      fetchMyStarredStreamerIdsOnServer(),
      fetchMyStarredGroupIdsOnServer(),
      fetchMyStarredCrewIdsOnServer(),
    ]);

    if (
      starredStreamerIds.length === 0 &&
      starredGroupIds.length === 0 &&
      starredCrewIds.length === 0
    ) {
      return [];
    }

    const supabase = createCommunityReadClient();
    if (!supabase) {
      return [];
    }

    const communityIdSet = new Set<number>();

    if (starredStreamerIds.length > 0) {
      const { data } = await supabase
        .from("communities")
        .select("id")
        .eq("community_type", "vlist")
        .in("streamer_id", starredStreamerIds);
      (data || []).forEach((row) => {
        if (typeof row.id === "number") communityIdSet.add(row.id);
      });
    }

    if (starredGroupIds.length > 0) {
      const { data } = await supabase
        .from("communities")
        .select("id")
        .eq("community_type", "group")
        .in("group_id", starredGroupIds);
      (data || []).forEach((row) => {
        if (typeof row.id === "number") communityIdSet.add(row.id);
      });
    }

    if (starredCrewIds.length > 0) {
      const { data } = await supabase
        .from("communities")
        .select("id")
        .eq("community_type", "crew")
        .in("crew_id", starredCrewIds);
      (data || []).forEach((row) => {
        if (typeof row.id === "number") communityIdSet.add(row.id);
      });
    }

    const communityIds = [...communityIdSet];
    if (communityIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from("community_posts")
      .select("id,title,community_id,category,like_count,view_count,created_at,published_at")
      .eq("status", "published")
      .in("community_id", communityIds)
      .order("published_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(10);

    if (error || !data) {
      return [];
    }

    return buildCommunityHubPostItems(supabase, data as CommunityPostBaseRow[]);
  } catch {
    return [];
  }
}

type CommunityEntityRow = {
  id: number;
  public_id?: string | null;
  group_code?: string | null;
  crew_code?: string | null;
  nickname?: string | null;
  name?: string | null;
  image_url: string | null;
  platform?: string | null;
  genre?: string[] | null;
};

type CommunityRelationRow = {
  id: number;
  community_type: "vlist" | "group" | "crew";
  streamer_id: number | null;
  group_id: number | null;
  crew_id: number | null;
};

type CommunityLatestPostRow = {
  community_id: number;
  published_at: string | null;
};

type CommunityBoardPostRow = Omit<CommunityBoardPost, "author_profile"> & {
  author_profile:
    | CommunityBoardPost["author_profile"]
    | CommunityBoardPost["author_profile"][]
    | null;
};

/**
 * /community/vlist, /community/group, /community/crew 화면 전용 목록을 만든다.
 * 왜: 일반 엔티티 목록과 커뮤니티 목록의 정렬 기준이 다르며,
 * 커뮤니티는 최신 글이 올라온 순서를 우선으로 보여주는 편이 탐색에 유리하다.
 */
export async function fetchCommunityDirectoryItemsOnServer({
  type,
  keyword = "",
  starredOnly = false,
  platform = "all",
  genre = "all",
  sortBy = "latest",
  sortOrder = "desc",
}: {
  type: "vlist" | "group" | "crew";
  keyword?: string;
  starredOnly?: boolean;
  platform?: string;
  genre?: string;
  sortBy?: "latest" | "name" | "postCount";
  sortOrder?: "asc" | "desc";
}): Promise<CommunityDirectoryItem[]> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const trimmedKeyword = keyword.trim();
    const trimmedPlatform = platform.trim().toLowerCase();
    const trimmedGenre = genre.trim();

    const starredIds =
      type === "vlist"
        ? await fetchMyStarredStreamerIdsOnServer()
        : type === "group"
          ? await fetchMyStarredGroupIdsOnServer()
          : await fetchMyStarredCrewIdsOnServer();
    const starredIdSet = new Set(starredIds);

    let entityRows: CommunityEntityRow[] = [];

    if (type === "vlist") {
      let query = supabase
        .from("streamers")
        .select("id,public_id,nickname,image_url,platform,genre")
        .order("nickname", { ascending: true });

      if (trimmedKeyword) {
        query = query.ilike("nickname", `%${trimmedKeyword}%`);
      }
      if (trimmedPlatform !== "all") {
        query = query.eq("platform", trimmedPlatform);
      }
      if (trimmedGenre && trimmedGenre !== "all") {
        query = query.contains("genre", [trimmedGenre]);
      }

      const { data, error } = await query;
      if (error || !data) return [];
      entityRows = data;
    } else if (type === "group") {
      let query = supabase
        .from("idol_groups")
        .select("id,group_code,name,image_url")
        .order("name", { ascending: true });

      if (trimmedKeyword) {
        query = query.ilike("name", `%${trimmedKeyword}%`);
      }

      const { data, error } = await query;
      if (error || !data) return [];
      entityRows = data;
    } else {
      let query = supabase
        .from("crews")
        .select("id,crew_code,name,image_url")
        .order("name", { ascending: true });

      if (trimmedKeyword) {
        query = query.ilike("name", `%${trimmedKeyword}%`);
      }

      const { data, error } = await query;
      if (error || !data) return [];
      entityRows = data;
    }

    if (entityRows.length === 0) {
      return [];
    }

    const entityIds = entityRows.map((row) => row.id);
    let communitiesQuery = supabase
      .from("communities")
      .select("id,community_type,streamer_id,group_id,crew_id")
      .eq("community_type", type);

    if (type === "vlist") {
      communitiesQuery = communitiesQuery.in("streamer_id", entityIds);
    } else if (type === "group") {
      communitiesQuery = communitiesQuery.in("group_id", entityIds);
    } else {
      communitiesQuery = communitiesQuery.in("crew_id", entityIds);
    }

    const { data: communitiesData, error: communitiesError } = await communitiesQuery;
    if (communitiesError || !communitiesData) {
      return [];
    }

    const communities = communitiesData as CommunityRelationRow[];
    const entityIdToCommunityId = new Map<number, number>();

    communities.forEach((community) => {
      const entityId =
        type === "vlist"
          ? community.streamer_id
          : type === "group"
            ? community.group_id
            : community.crew_id;

      if (typeof entityId === "number") {
        entityIdToCommunityId.set(entityId, community.id);
      }
    });

    const communityIds = communities.map((community) => community.id);
    const latestPostAtByCommunityId = new Map<number, string | null>();
    const recentPostCount24hByCommunityId = new Map<number, number>();

    if (communityIds.length > 0) {
      const { data: latestPostRows, error: latestPostError } = await supabase
        .from("community_posts")
        .select("community_id,published_at")
        .eq("status", "published")
        .in("community_id", communityIds)
        .order("published_at", { ascending: false })
        .range(0, 4999);

      if (!latestPostError && latestPostRows) {
        (latestPostRows as CommunityLatestPostRow[]).forEach((row) => {
          if (!latestPostAtByCommunityId.has(row.community_id)) {
            latestPostAtByCommunityId.set(row.community_id, row.published_at);
          }
        });
      }

      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: recentPostRows, error: recentPostError } = await supabase
        .from("community_posts")
        .select("community_id")
        .eq("status", "published")
        .gte("published_at", since)
        .in("community_id", communityIds)
        .range(0, 9999);

      if (!recentPostError && recentPostRows) {
        recentPostRows.forEach((row) => {
          if (typeof row.community_id !== "number") return;
          recentPostCount24hByCommunityId.set(
            row.community_id,
            (recentPostCount24hByCommunityId.get(row.community_id) || 0) + 1
          );
        });
      }
    }

    const memberImagesByEntityId = new Map<
      number,
      Array<{ id: number; imageUrl: string | null; name: string }>
    >();
    const memberCountByEntityId = new Map<number, number>();

    if (type === "group" || type === "crew") {
      const { data: streamersData, error: streamersError } = await supabase
        .from("streamers")
        .select("id,public_id,nickname,image_url,group_codes,group_name,crew_name");

      if (!streamersError && streamersData) {
        const entityByCode = new Map(
          entityRows.map((row) => {
            const code =
              type === "group"
                ? row.group_code?.trim().toLowerCase()
                : row.crew_code?.trim().toLowerCase();
            return [code, row.id] as const;
          })
        );

        streamersData.forEach((streamer) => {
          const memberImage = {
            id: streamer.id,
            imageUrl: streamer.image_url || null,
            name: streamer.nickname || `멤버 ${streamer.id}`,
          };

          const candidateCodes =
            type === "group"
              ? [...(streamer.group_codes || []), ...(streamer.group_name || [])]
              : [...(streamer.crew_name || [])];

          const uniqueCodes = new Set(
            candidateCodes
              .map((value) => (value || "").trim().toLowerCase())
              .filter(Boolean)
          );

          uniqueCodes.forEach((code) => {
            const entityId = entityByCode.get(code);
            if (!entityId) return;

            const currentMembers = memberImagesByEntityId.get(entityId) || [];
            currentMembers.push(memberImage);
            memberImagesByEntityId.set(entityId, currentMembers);
            memberCountByEntityId.set(entityId, currentMembers.length);
          });
        });
      }
    }

    const mappedItems = entityRows
      .map((row) => {
        if (type === "vlist" && !row.public_id) {
          return null;
        }

        const name =
          type === "vlist"
            ? row.nickname || `버츄얼 ${row.id}`
            : row.name || `${type === "group" ? "그룹" : "소속"} ${row.id}`;
        const href =
          type === "vlist"
            ? `/community/vlist/${row.public_id}`
            : type === "group"
              ? `/community/group/${row.group_code ?? row.id}`
              : `/community/crew/${row.crew_code ?? row.id}`;
        const communityId = entityIdToCommunityId.get(row.id);

        return {
          id: `${type}-${row.id}`,
          type,
          name,
          href,
          imageUrl: row.image_url || null,
          isStarred: starredIdSet.has(row.id),
          latestPostAt:
            typeof communityId === "number"
              ? latestPostAtByCommunityId.get(communityId) || null
              : null,
          recentPostCount24h:
            typeof communityId === "number"
              ? recentPostCount24hByCommunityId.get(communityId) || 0
              : 0,
          platform: row.platform || null,
          genres: Array.isArray(row.genre) ? row.genre.filter(Boolean) : [],
          memberImages: (memberImagesByEntityId.get(row.id) || []).slice(0, 9),
          memberCount: memberCountByEntityId.get(row.id) || 0,
        };
      });

    const items: CommunityDirectoryItem[] = mappedItems
      .filter((item): item is NonNullable<(typeof mappedItems)[number]> => item !== null)
      .filter((item) => (starredOnly ? item.isStarred : true))
      .sort((a, b) => {
        const aTime = a.latestPostAt ? new Date(a.latestPostAt).getTime() : Number.NEGATIVE_INFINITY;
        const bTime = b.latestPostAt ? new Date(b.latestPostAt).getTime() : Number.NEGATIVE_INFINITY;
        const latestDiff = aTime - bTime;
        const nameDiff = a.name.localeCompare(b.name, "ko");
        const postCountDiff = a.recentPostCount24h - b.recentPostCount24h;

        if (sortBy === "name") {
          if (nameDiff !== 0) {
            return sortOrder === "asc" ? nameDiff : -nameDiff;
          }
          return bTime - aTime;
        }

        if (sortBy === "postCount") {
          if (postCountDiff !== 0) {
            return sortOrder === "asc" ? postCountDiff : -postCountDiff;
          }
          return bTime - aTime;
        }

        if (latestDiff !== 0) {
          return sortOrder === "asc" ? latestDiff : -latestDiff;
        }

        return nameDiff;
      });

    return items;
  } catch {
    return [];
  }
}

export async function fetchCommunityStreamerGenresOnServer(): Promise<string[]> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data, error } = await supabase.from("streamers").select("genre");

    if (error || !data) {
      return [];
    }

    const genreSet = new Set<string>();
    data.forEach((row) => {
      (row.genre || []).forEach((genreItem: string) => {
        const normalizedGenre = (genreItem || "").trim();
        if (normalizedGenre) {
          genreSet.add(normalizedGenre);
        }
      });
    });

    return [...genreSet].sort((a, b) => a.localeCompare(b, "ko"));
  } catch {
    return [];
  }
}

export async function fetchCommunityVlistBoardMetaOnServer(
  publicId: string
): Promise<CommunityBoardMeta | null> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: streamer, error: streamerError } = await supabase
      .from("streamers")
      .select("id,public_id,nickname,image_url")
      .eq("public_id", publicId)
      .maybeSingle();

    if (streamerError || !streamer) {
      return null;
    }

    const { data: community } = await supabase
      .from("communities")
      .select("id")
      .eq("community_type", "vlist")
      .eq("streamer_id", streamer.id)
      .maybeSingle();

    return {
      communityId: typeof community?.id === "number" ? community.id : null,
      entityType: "vlist",
      entityId: streamer.id,
      entityName: streamer.nickname || `버츄얼 ${streamer.id}`,
      entityPublicId: streamer.public_id || publicId,
      imageUrl: streamer.image_url || null,
    };
  } catch {
    return null;
  }
}

export async function fetchCommunityGroupBoardMetaOnServer(
  groupCode: string
): Promise<CommunityBoardMeta | null> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const normalizedCode = groupCode.trim().toLowerCase();
    const { data: group, error: groupError } = await supabase
      .from("idol_groups")
      .select("id,group_code,name,image_url")
      .ilike("group_code", normalizedCode)
      .maybeSingle();

    if (groupError || !group) {
      return null;
    }

    const { data: community } = await supabase
      .from("communities")
      .select("id")
      .eq("community_type", "group")
      .eq("group_id", group.id)
      .maybeSingle();

    return {
      communityId: typeof community?.id === "number" ? community.id : null,
      entityType: "group",
      entityId: group.id,
      entityName: group.name || `그룹 ${group.id}`,
      entityPublicId: group.group_code || groupCode,
      imageUrl: group.image_url || null,
    };
  } catch {
    return null;
  }
}

export async function fetchCommunityCrewBoardMetaOnServer(
  crewCode: string
): Promise<CommunityBoardMeta | null> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const normalizedCode = crewCode.trim().toLowerCase();
    const { data: crew, error: crewError } = await supabase
      .from("crews")
      .select("id,crew_code,name,image_url")
      .ilike("crew_code", normalizedCode)
      .maybeSingle();

    if (crewError || !crew) {
      return null;
    }

    const { data: community } = await supabase
      .from("communities")
      .select("id")
      .eq("community_type", "crew")
      .eq("crew_id", crew.id)
      .maybeSingle();

    return {
      communityId: typeof community?.id === "number" ? community.id : null,
      entityType: "crew",
      entityId: crew.id,
      entityName: crew.name || `소속 ${crew.id}`,
      entityPublicId: crew.crew_code || crewCode,
      imageUrl: crew.image_url || null,
    };
  } catch {
    return null;
  }
}

export async function ensureCommunityIdOnServer(
  meta: CommunityBoardMeta
): Promise<number | null> {
  if (meta.communityId) {
    return meta.communityId;
  }

  const admin = createCommunityAdminClient();
  if (!admin) {
    return null;
  }

  const insertPayload =
    meta.entityType === "vlist"
      ? { community_type: "vlist", streamer_id: meta.entityId }
      : meta.entityType === "group"
        ? { community_type: "group", group_id: meta.entityId }
        : { community_type: "crew", crew_id: meta.entityId };
  let existingQuery = admin
    .from("communities")
    .select("id")
    .eq("community_type", meta.entityType);

  existingQuery =
    meta.entityType === "vlist"
      ? existingQuery.eq("streamer_id", meta.entityId)
      : meta.entityType === "group"
        ? existingQuery.eq("group_id", meta.entityId)
        : existingQuery.eq("crew_id", meta.entityId);

  const { data: existing } = await existingQuery.maybeSingle();
  if (typeof existing?.id === "number") {
    return existing.id;
  }

  const { data: inserted } = await admin
    .from("communities")
    .insert(insertPayload)
    .select("id")
    .maybeSingle();

  if (typeof inserted?.id === "number") {
    return inserted.id;
  }

  let retryQuery = admin
    .from("communities")
    .select("id")
    .eq("community_type", meta.entityType);

  retryQuery =
    meta.entityType === "vlist"
      ? retryQuery.eq("streamer_id", meta.entityId)
      : meta.entityType === "group"
        ? retryQuery.eq("group_id", meta.entityId)
        : retryQuery.eq("crew_id", meta.entityId);

  const { data: retried } = await retryQuery.maybeSingle();
  return typeof retried?.id === "number" ? retried.id : null;
}

export async function fetchCommunityPostsByCommunityIdOnServer({
  communityId,
  page = 1,
  pageSize = 20,
  searchField = "title_content",
  keyword = "",
}: {
  communityId: number | null;
  page?: number;
  pageSize?: number;
  searchField?: CommunityPostSearchField;
  keyword?: string;
}): Promise<CommunityBoardListResult> {
  if (!communityId) {
    return {
      items: [],
      totalCount: 0,
    };
  }

  try {
    const supabase = createCommunityReadClient();
    if (!supabase) {
      return {
        items: [],
        totalCount: 0,
      };
    }
    let query = supabase
      .from("community_posts")
      .select(
        "id,community_id,author_id,category,title,status,is_pinned,view_count,like_count,comment_count,created_at,published_at,author_profile:profiles!community_posts_author_id_fkey(nickname,avatar_url,public_id)",
        { count: "exact" }
      )
      .eq("community_id", communityId)
      .eq("status", "published")
      .is("deleted_at", null)
      .order("is_pinned", { ascending: false })
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("id", { ascending: false });

    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword) {
      const matchedIds = await fetchCommunityPostIdsByKeyword({
        supabase,
        communityId,
        keyword: trimmedKeyword,
        searchField,
      });

      if (!matchedIds || matchedIds.length === 0) {
        return {
          items: [],
          totalCount: 0,
        };
      }

      query = query.in("id", matchedIds);
    }

    const from = (Math.max(page, 1) - 1) * pageSize;
    const to = from + pageSize - 1;
    const { data, error, count } = await query.range(from, to);

    if (error || !data) {
      return {
        items: [],
        totalCount: 0,
      };
    }

    return {
      items: (data as CommunityBoardPostRow[]).map((row) => ({
        ...row,
        author_profile: Array.isArray(row.author_profile)
          ? row.author_profile[0] || null
          : row.author_profile,
      })),
      totalCount: count ?? 0,
    };
  } catch {
    return {
      items: [],
      totalCount: 0,
    };
  }
}

export async function fetchPublishedCommunityPostByIdOnServer({
  postId,
  communityId,
}: {
  postId: number;
  communityId: number | null;
}): Promise<CommunityPost | null> {
  if (!communityId || !Number.isInteger(postId) || postId <= 0) {
    return null;
  }

  try {
    const supabase = createCommunityReadClient();
    if (!supabase) {
      return null;
    }
    const { data, error } = await supabase
      .from("community_posts")
      .select(
        "id,community_id,author_id,category,title,content_html,content_json,status,is_pinned,view_count,like_count,comment_count,created_at,updated_at,published_at,deleted_at,deleted_by,author_profile:profiles!community_posts_author_id_fkey(nickname,avatar_url,public_id)"
      )
      .eq("id", postId)
      .eq("community_id", communityId)
      .eq("status", "published")
      .is("deleted_at", null)
      .maybeSingle();

    if (error || !data) {
      return null;
    }

    const row = data as CommunityPost & {
      author_profile: CommunityPost["author_profile"] | CommunityPost["author_profile"][];
    };

    return {
      ...row,
      author_profile: Array.isArray(row.author_profile)
        ? row.author_profile[0] || null
        : row.author_profile,
    };
  } catch {
    return null;
  }
}

export async function fetchEditableCommunityPostByIdOnServer({
  postId,
  communityId,
  viewerId,
  canManage,
}: {
  postId: number;
  communityId: number | null;
  viewerId: string;
  canManage: boolean;
}): Promise<CommunityPost | null> {
  if (!communityId || !Number.isInteger(postId) || postId <= 0 || !viewerId) {
    return null;
  }

  try {
    const supabase = createCommunityReadClient();
    if (!supabase) {
      return null;
    }
    let query = supabase
      .from("community_posts")
      .select(
        "id,community_id,author_id,category,title,content_html,content_json,status,is_pinned,view_count,like_count,comment_count,created_at,updated_at,published_at,deleted_at,deleted_by,author_profile:profiles!community_posts_author_id_fkey(nickname,avatar_url,public_id)"
      )
      .eq("id", postId)
      .eq("community_id", communityId)
      .is("deleted_at", null)
      .in("status", ["draft", "published"]);

    if (!canManage) {
      query = query.eq("author_id", viewerId);
    }

    const { data, error } = await query.maybeSingle();

    if (error || !data) {
      return null;
    }

    const row = data as CommunityPost & {
      author_profile: CommunityPost["author_profile"] | CommunityPost["author_profile"][];
    };

    return {
      ...row,
      author_profile: Array.isArray(row.author_profile)
        ? row.author_profile[0] || null
        : row.author_profile,
    };
  } catch {
    return null;
  }
}
