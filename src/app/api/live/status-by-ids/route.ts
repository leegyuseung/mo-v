import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { LiveStatusByStreamerId, LiveStreamerStatus } from "@/types/live";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const MAX_BATCH_SIZE = 100;
const STATUS_CACHE_TTL_MS = 20_000;

type StreamerStatusRow = {
  id: number;
  chzzk_id: string | null;
  soop_id: string | null;
};

type StatusCacheEntry = {
  data: LiveStreamerStatus;
  updatedAt: number;
};

const statusCache = new Map<string, StatusCacheEntry>();
const LIVE_STATUS_CONCURRENCY = 10;

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeImageUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  let normalized = value.trim();
  if (!normalized) return null;
  if (normalized.startsWith("//")) normalized = `https:${normalized}`;
  if (normalized.startsWith("http://")) {
    normalized = normalized.replace(/^http:\/\//i, "https://");
  }
  normalized = normalized
    .replace(/\{type\}/gi, "f320_180")
    .replace(/\{width\}/gi, "640")
    .replace(/\{height\}/gi, "360");
  if (/[{}]/.test(normalized)) return null;
  return normalized;
}

async function fetchChzzkLiveStatus(channelId: string): Promise<LiveStreamerStatus> {
  const cached = statusCache.get(channelId);
  const now = Date.now();
  if (cached && now - cached.updatedAt < STATUS_CACHE_TTL_MS) {
    return cached.data;
  }

  const liveUrl = `https://chzzk.naver.com/live/${channelId}`;
  let responseData: LiveStreamerStatus = {
    isLive: false,
    viewerCount: null,
    liveTitle: null,
    liveThumbnailImageUrl: null,
    liveUrl,
  };

  try {
    const response = await fetch(
      `https://api.chzzk.naver.com/polling/v3.1/channels/${encodeURIComponent(channelId)}/live-status`,
      { method: "GET", cache: "no-store" }
    );

    if (response.ok) {
      const payload = (await response.json()) as Record<string, unknown>;
      const content = (payload.content ?? payload.data ?? payload) as Record<string, unknown>;
      const statusText = String(content.status ?? content.liveStatus ?? "").toUpperCase();
      responseData = {
        isLive: statusText === "OPEN" || statusText === "LIVE" || content.openLive === true,
        viewerCount: parseNumber(content.concurrentUserCount ?? content.viewerCount ?? content.watchingCount),
        liveTitle: (content.liveTitle as string | undefined) || (content.title as string | undefined) || null,
        liveThumbnailImageUrl:
          normalizeImageUrl(content.liveThumbnailImageUrl) ||
          normalizeImageUrl(content.thumbnailImageUrl) ||
          normalizeImageUrl(content.thumbnailUrl),
        liveUrl,
      };
    }
  } catch {
    // 네트워크 오류 시 오프라인으로 처리
  }

  statusCache.set(channelId, { data: responseData, updatedAt: now });
  return responseData;
}

function buildSoopOfflineStatus(soopId: string | null): LiveStreamerStatus {
  return {
    isLive: false,
    viewerCount: null,
    liveTitle: null,
    liveThumbnailImageUrl: null,
    liveUrl: soopId ? `https://www.sooplive.co.kr/station/${soopId}` : null,
  };
}

function normalizeIds(rawIds: unknown): number[] {
  if (!Array.isArray(rawIds)) return [];
  const parsed = rawIds
    .map((value) => (typeof value === "number" ? value : Number(value)))
    .filter((value) => Number.isInteger(value) && value > 0);
  const unique = Array.from(new Set(parsed));
  return unique.slice(0, MAX_BATCH_SIZE);
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T) => Promise<R>
): Promise<R[]> {
  if (items.length === 0) return [];

  const results = new Array<R>(items.length);
  let index = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (index < items.length) {
      const currentIndex = index++;
      results[currentIndex] = await mapper(items[currentIndex]);
    }
  });

  await Promise.all(workers);
  return results;
}

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { ids?: unknown };
    const ids = normalizeIds(body?.ids);

    if (ids.length === 0) {
      return NextResponse.json({} as LiveStatusByStreamerId, {
        headers: {
          "Cache-Control": "public, s-maxage=20, stale-while-revalidate=40",
        },
      });
    }

    const { data, error } = await supabase
      .from("streamers")
      .select("id,chzzk_id,soop_id")
      .in("id", ids);

    if (error) {
      throw error;
    }

    const rows = (data || []) as StreamerStatusRow[];
    const statusEntries = await mapWithConcurrency(rows, LIVE_STATUS_CONCURRENCY, async (row) => {
        const status = row.chzzk_id
          ? await fetchChzzkLiveStatus(row.chzzk_id)
          : buildSoopOfflineStatus(row.soop_id);
        return [row.id, status] as const;
      });

    const statusById = Object.fromEntries(statusEntries) as LiveStatusByStreamerId;

    return NextResponse.json(statusById, {
      headers: {
        "Cache-Control": "public, s-maxage=20, stale-while-revalidate=40",
      },
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to fetch statuses" },
      { status: 500 }
    );
  }
}
