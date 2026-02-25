import { cookies, headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { LiveStreamer } from "@/types/live";
import type { LiveBox, LiveBoxParticipantProfile } from "@/types/live-box";

function normalizeBaseUrl(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

async function resolveBaseUrl() {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");

  if (envUrl) {
    return normalizeBaseUrl(envUrl);
  }

  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");

  if (!host) return null;

  const protocol =
    headerStore.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");

  return `${protocol}://${host}`;
}

/** 서버 컴포넌트에서 공개 라이브박스 목록을 조회한다. */
export async function fetchPublicLiveBoxesOnServer(): Promise<LiveBox[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("live_box")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as LiveBox[];
}

/** 서버 컴포넌트에서 공개 라이브박스 단건을 조회한다. */
export async function fetchPublicLiveBoxByIdOnServer(liveBoxId: number): Promise<LiveBox | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("live_box")
    .select("*")
    .eq("id", liveBoxId)
    .maybeSingle();

  if (error) throw error;
  return (data as LiveBox | null) ?? null;
}

/** 서버 컴포넌트에서 라이브박스 참여자 최소 프로필을 조회한다. */
export async function fetchLiveBoxParticipantProfilesOnServer(): Promise<LiveBoxParticipantProfile[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("streamers")
    .select("id,nickname,image_url,chzzk_id,soop_id");

  if (error) throw error;
  return (data || []) as LiveBoxParticipantProfile[];
}

/** 서버 컴포넌트에서 현재 라이브 데이터(API route)를 조회한다. */
export async function fetchLiveStreamersOnServer(): Promise<LiveStreamer[]> {
  const baseUrl = await resolveBaseUrl();
  if (!baseUrl) return [];

  const response = await fetch(`${baseUrl}/api/live/all`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to fetch live streamers");
  }

  return (await response.json()) as LiveStreamer[];
}
