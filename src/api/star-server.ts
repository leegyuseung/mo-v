import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

async function fetchCurrentUserIdOnServer(): Promise<string | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

/** 서버 컴포넌트에서 현재 로그인 유저의 즐겨찾기 버츄얼 ID 목록을 조회한다. */
export async function fetchMyStarredStreamerIdsOnServer(): Promise<number[]> {
  const userId = await fetchCurrentUserIdOnServer();
  if (!userId) return [];

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("user_star_streamers")
    .select("streamer_id")
    .eq("user_id", userId);

  if (error || !data) return [];
  return data
    .map((row) => row.streamer_id)
    .filter((id): id is number => typeof id === "number");
}

/** 서버 컴포넌트에서 현재 로그인 유저의 즐겨찾기 그룹 ID 목록을 조회한다. */
export async function fetchMyStarredGroupIdsOnServer(): Promise<number[]> {
  const userId = await fetchCurrentUserIdOnServer();
  if (!userId) return [];

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("user_star_groups")
    .select("group_id")
    .eq("user_id", userId);

  if (error || !data) return [];
  return data
    .map((row) => row.group_id)
    .filter((id): id is number => typeof id === "number");
}

/** 서버 컴포넌트에서 현재 로그인 유저의 즐겨찾기 소속 ID 목록을 조회한다. */
export async function fetchMyStarredCrewIdsOnServer(): Promise<number[]> {
  const userId = await fetchCurrentUserIdOnServer();
  if (!userId) return [];

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from("user_star_crews")
    .select("crew_id")
    .eq("user_id", userId);

  if (error || !data) return [];
  return data
    .map((row) => row.crew_id)
    .filter((id): id is number => typeof id === "number");
}
