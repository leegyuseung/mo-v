import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { Content } from "@/types/content";

/** 서버 컴포넌트에서 콘텐츠 목록을 최신순으로 조회한다. */
export async function fetchPublicContentsOnServer(): Promise<Content[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

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
