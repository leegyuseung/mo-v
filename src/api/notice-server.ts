import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import type { NoticeCategory, NoticePost } from "@/types/notice";
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

export async function fetchPublishedNoticesOnServer(
  category?: NoticeCategory
): Promise<NoticePost[]> {
  const admin = createNoticeAdminClient();
  if (!admin) return [];

  let query = admin
    .from("notice_posts")
    .select("*")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("is_pinned", { ascending: false })
    .order("published_at", { ascending: false })
    .order("id", { ascending: false });

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data as NoticePost[];
}
