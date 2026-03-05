import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { Content } from "@/types/content";

async function trySyncContentsStatuses(supabase: ReturnType<typeof createClient>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  // pg_cron 미설정 환경에서도 조회 시점에 마감 상태를 동기화 시도한다.
  try {
    await supabase.rpc("end_expired_contents");
  } catch {
    // 함수 미존재/권한 문제여도 조회 자체는 계속 진행한다.
  }
}

/** 서버 컴포넌트에서 콘텐츠 목록을 최신순으로 조회한다. */
export async function fetchPublicContentsOnServer(): Promise<Content[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  await trySyncContentsStatuses(supabase);

  const { data, error } = await supabase
    .from("contents")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as Content[];
}

/** 서버 컴포넌트에서 콘텐츠 단건을 조회한다. */
export async function fetchPublicContentByIdOnServer(contentId: number): Promise<Content | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  await trySyncContentsStatuses(supabase);

  const { data, error } = await supabase
    .from("contents")
    .select("*")
    .eq("id", contentId)
    .maybeSingle();

  if (error) throw error;
  return (data as Content | null) ?? null;
}

/** 서버 컴포넌트에서 현재 로그인 유저의 콘텐츠 좋아요 여부를 조회한다. */
export async function fetchIsContentFavoriteOnServer(contentId: number): Promise<boolean> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data, error } = await supabase
    .from("content_favorites")
    .select("content_id")
    .eq("content_id", contentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) return false;
  return Boolean(data);
}

/** 서버 컴포넌트에서 현재 로그인 유저의 콘텐츠 좋아요 ID 목록을 조회한다. */
export async function fetchMyFavoriteContentIdsOnServer(): Promise<number[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("content_favorites")
    .select("content_id")
    .eq("user_id", user.id);

  if (error || !data) return [];

  return data
    .map((row) => row.content_id)
    .filter((contentId): contentId is number => Number.isFinite(contentId));
}
