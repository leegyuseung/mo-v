import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import type {
  NoticeListQuery,
  NoticeListResult,
  NoticePost,
} from "@/types/notice";
import { isAdminRole } from "@/utils/role";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isNoticeServerConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey && serviceRoleKey);
}

export function createNoticeAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createAdminClient(supabaseUrl, serviceRoleKey);
}

export function createNoticeRequestClient(
  cookieStore: Awaited<ReturnType<typeof import("next/headers").cookies>>
) {
  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      },
    },
  });
}

export async function fetchNoticeAuthContext(
  cookieStore: Awaited<ReturnType<typeof import("next/headers").cookies>>
): Promise<{
  supabase: ReturnType<typeof createNoticeRequestClient>;
  user: User | null;
  role: string | null;
  userError: Error | null;
}> {
  const supabase = createNoticeRequestClient(cookieStore);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return {
      supabase,
      user: null,
      role: null,
      userError: userError ?? new Error("로그인이 필요합니다."),
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    supabase,
    user,
    role: profile?.role ?? null,
    userError: null,
  };
}

export async function canManageNoticeOnServer(
  cookieStore: Awaited<ReturnType<typeof import("next/headers").cookies>>
) {
  if (!isNoticeServerConfigured()) return false;

  const { role } = await fetchNoticeAuthContext(cookieStore);
  return isAdminRole(role);
}

export async function fetchPublishedNoticesOnServer({
  page = 1,
  pageSize = 20,
  category,
  searchField = "title_content",
  keyword = "",
}: NoticeListQuery = {}): Promise<NoticeListResult> {
  const admin = createNoticeAdminClient();
  if (!admin) {
    return {
      items: [],
      totalCount: 0,
    };
  }

  let query = admin
    .from("notice_posts")
    .select(
      "*, author_profile:profiles!notice_posts_author_id_fkey(nickname,avatar_url,public_id)",
      { count: "exact" }
    )
    .eq("status", "published")
    .is("deleted_at", null)
    .order("is_pinned", { ascending: false })
    .order("published_at", { ascending: false })
    .order("id", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  const trimmedKeyword = keyword.trim();
  if (trimmedKeyword) {
    const escapedKeyword = trimmedKeyword.replace(/[%_]/g, "\\$&");
    const likeKeyword = `%${escapedKeyword}%`;

    if (searchField === "title") {
      query = query.ilike("title", likeKeyword);
    } else if (searchField === "content") {
      query = query.ilike("content_html", likeKeyword);
    } else {
      query = query.or(`title.ilike.${likeKeyword},content_html.ilike.${likeKeyword}`);
    }
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
    items: data as NoticePost[],
    totalCount: count ?? 0,
  };
}

export async function fetchPublishedNoticeByIdOnServer(
  noticeId: number
): Promise<NoticePost | null> {
  const admin = createNoticeAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .from("notice_posts")
    .select("*, author_profile:profiles!notice_posts_author_id_fkey(nickname,avatar_url,public_id)")
    .eq("id", noticeId)
    .eq("status", "published")
    .is("deleted_at", null)
    .maybeSingle();

  if (error) return null;

  return (data as NoticePost | null) ?? null;
}
