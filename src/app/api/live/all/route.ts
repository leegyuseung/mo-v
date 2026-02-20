import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase 서버 클라이언트 (Route Handler 전용, 공개 읽기) ─────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// ─── 인메모리 캐시 ──────────────────────────────────────────────────
type CacheEntry = {
    data: unknown[];
    updatedAt: number;
};

const CACHE_TTL_MS = 30_000; // 30초
let cache: CacheEntry | null = null;
let refreshPromise: Promise<unknown[]> | null = null;

// ─── 치지직 라이브 상태 조회 ─────────────────────────────────────────

function parseNumber(v: unknown): number | null {
    if (typeof v === "number" && Number.isFinite(v)) return v;
    if (typeof v === "string") {
        const n = Number(v.replace(/,/g, ""));
        return Number.isFinite(n) ? n : null;
    }
    return null;
}

function normalizeImageUrl(v: unknown): string | null {
    if (typeof v !== "string") return null;
    let url = v.trim();
    if (!url) return null;
    if (url.startsWith("//")) url = `https:${url}`;
    if (url.startsWith("http://")) url = url.replace(/^http:\/\//i, "https://");
    url = url
        .replace(/\{type\}/gi, "f320_180")
        .replace(/\{width\}/gi, "640")
        .replace(/\{height\}/gi, "360");
    if (/[{}]/.test(url)) return null;
    return url;
}

async function fetchChzzkLiveStatus(channelId: string) {
    const liveUrl = `https://chzzk.naver.com/live/${channelId}`;
    try {
        const res = await fetch(
            `https://api.chzzk.naver.com/polling/v3.1/channels/${encodeURIComponent(channelId)}/live-status`,
            { method: "GET", cache: "no-store" },
        );
        if (!res.ok) {
            return { isLive: false, viewerCount: null, liveTitle: null, liveThumbnailImageUrl: null, liveUrl };
        }
        const payload = (await res.json()) as Record<string, unknown>;
        const content = (payload.content ?? payload.data ?? payload) as Record<string, unknown>;
        const statusText = String(content.status ?? content.liveStatus ?? "").toUpperCase();
        return {
            isLive: statusText === "OPEN" || statusText === "LIVE" || content.openLive === true,
            viewerCount: parseNumber(content.concurrentUserCount ?? content.viewerCount ?? content.watchingCount),
            liveTitle: (content.liveTitle as string | undefined) || (content.title as string | undefined) || null,
            liveThumbnailImageUrl:
                normalizeImageUrl(content.liveThumbnailImageUrl) ||
                normalizeImageUrl(content.thumbnailImageUrl) ||
                normalizeImageUrl(content.thumbnailUrl),
            liveUrl,
        };
    } catch {
        return { isLive: false, viewerCount: null, liveTitle: null, liveThumbnailImageUrl: null, liveUrl };
    }
}

// ─── 동시성 제한 매퍼 ────────────────────────────────────────────────

async function mapWithConcurrency<T, R>(
    items: T[],
    limit: number,
    mapper: (item: T) => Promise<R>,
): Promise<R[]> {
    if (!items.length) return [];
    const results: R[] = new Array(items.length);
    let idx = 0;
    const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (idx < items.length) {
            const i = idx++;
            results[i] = await mapper(items[i]);
        }
    });
    await Promise.all(workers);
    return results;
}

// ─── 일괄 조회 + 캐시 갱신 ─────────────────────────────────────────

async function refreshLiveData(): Promise<unknown[]> {
    const { data: streamers, error } = await supabase
        .from("streamers")
        .select("*")
        .order("nickname", { ascending: true })
        .range(0, 4999);

    if (error) throw error;
    const rows = streamers || [];

    const statuses = await mapWithConcurrency(rows, 20, async (streamer: Record<string, unknown>) => {
        const chzzkId = streamer.chzzk_id as string | null;
        const soopId = streamer.soop_id as string | null;

        // soop은 현재 API 미지원
        if (!chzzkId) {
            return {
                isLive: false,
                viewerCount: null,
                liveTitle: null,
                liveThumbnailImageUrl: null,
                liveUrl: soopId
                    ? `https://www.sooplive.co.kr/station/${soopId}`
                    : null,
            };
        }
        return fetchChzzkLiveStatus(chzzkId);
    });

    return rows.map((streamer, i) => ({ ...streamer, ...statuses[i] }));
}

async function getLiveData(): Promise<unknown[]> {
    const now = Date.now();

    // 캐시가 유효하면 즉시 반환
    if (cache && now - cache.updatedAt < CACHE_TTL_MS) {
        return cache.data;
    }

    // 이미 갱신 중이면 진행 중인 Promise를 재활용 (thundering herd 방지)
    if (refreshPromise) {
        return refreshPromise;
    }

    refreshPromise = refreshLiveData()
        .then((data) => {
            cache = { data, updatedAt: Date.now() };
            refreshPromise = null;
            return data;
        })
        .catch((err) => {
            refreshPromise = null;
            // 캐시가 있으면 stale 데이터라도 반환
            if (cache) return cache.data;
            throw err;
        });

    return refreshPromise;
}

// ─── Route Handler ──────────────────────────────────────────────────

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const data = await getLiveData();
        return NextResponse.json(data, {
            headers: {
                "Cache-Control": "public, s-maxage=20, stale-while-revalidate=40",
            },
        });
    } catch (error) {
        return NextResponse.json(
            { message: error instanceof Error ? error.message : "Failed to fetch live data" },
            { status: 500 },
        );
    }
}
