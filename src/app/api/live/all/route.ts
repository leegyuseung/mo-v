import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type {
  LiveStreamer,
  LiveCacheEntry,
  LiveCacheKey,
  StreamerRow,
  StreamerMetadataCacheEntry,
} from "@/types/live";
import {
  buildChzzkOfflineStatus,
  buildSoopOfflineStatus,
  getOfficialPlatformLiveMaps,
} from "@/lib/official-live";

// ─── Supabase 서버 클라이언트 (Route Handler 전용, 공개 읽기) ─────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const STREAMER_SELECT_COLUMNS =
  "id,public_id,nickname,image_url,platform,group_name,crew_name,genre,chzzk_id,soop_id";
const CACHE_TTL_MS = 30_000; // 30초
const STREAMER_METADATA_CACHE_TTL_MS = 10 * 60_000;
const cache = new Map<LiveCacheKey, LiveCacheEntry>();
const refreshPromises = new Map<LiveCacheKey, Promise<LiveStreamer[]>>();
let streamerMetadataCache: StreamerMetadataCacheEntry | null = null;
let streamerMetadataRefreshPromise: Promise<StreamerRow[]> | null = null;

// ─── 일괄 조회 + 캐시 갱신 ─────────────────────────────────────────

async function getStreamerRows(): Promise<StreamerRow[]> {
  const now = Date.now();

  if (streamerMetadataCache && now - streamerMetadataCache.updatedAt < STREAMER_METADATA_CACHE_TTL_MS) {
    return streamerMetadataCache.rows;
  }

  if (streamerMetadataRefreshPromise) {
    return streamerMetadataRefreshPromise;
  }

  streamerMetadataRefreshPromise = (async () => {
    try {
      const { data: streamers, error } = await supabase
        .from("streamers")
        .select(STREAMER_SELECT_COLUMNS)
        .order("nickname", { ascending: true })
        .range(0, 4999);

      if (error) throw error;

      const rows = (streamers || []) as StreamerRow[];
      streamerMetadataCache = {
        rows,
        updatedAt: Date.now(),
      };
      return rows;
    } catch (error) {
      if (streamerMetadataCache) {
        return streamerMetadataCache.rows;
      }
      throw error;
    } finally {
      streamerMetadataRefreshPromise = null;
    }
  })();

  return streamerMetadataRefreshPromise;
}

function mergeStreamerWithLiveStatus(streamer: StreamerRow, isLiveOnly: boolean) {
  const chzzkId = streamer.chzzk_id;
  const soopId = streamer.soop_id;
  const platform = streamer.platform;

  return (statusMaps: Awaited<ReturnType<typeof getOfficialPlatformLiveMaps>>) => {
    const liveStatus =
      platform === "soop" || (!chzzkId && soopId)
        ? soopId
          ? statusMaps.soop.get(soopId) || buildSoopOfflineStatus(soopId)
          : buildSoopOfflineStatus(null)
        : chzzkId
          ? statusMaps.chzzk.get(chzzkId) || buildChzzkOfflineStatus(chzzkId)
          : buildChzzkOfflineStatus(null);

    if (isLiveOnly && !liveStatus.isLive) {
      return null;
    }

    return { ...streamer, ...liveStatus } as LiveStreamer;
  };
}

async function refreshLiveData(cacheKey: LiveCacheKey): Promise<LiveStreamer[]> {
    const isLiveOnly = cacheKey === "liveOnly";
    const [rows, statusMaps] = await Promise.all([
      getStreamerRows(),
      getOfficialPlatformLiveMaps(),
    ]);

    const mergedRows = rows
      .map((streamer) => mergeStreamerWithLiveStatus(streamer, isLiveOnly)(statusMaps))
      .filter((streamer): streamer is LiveStreamer => streamer !== null);

    return mergedRows;
}

async function getLiveData(cacheKey: LiveCacheKey): Promise<LiveStreamer[]> {
  const now = Date.now();
  const cached = cache.get(cacheKey);

  // 캐시가 유효하면 즉시 반환
  if (cached && now - cached.updatedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  // 이미 갱신 중이면 진행 중인 Promise를 재활용 (thundering herd 방지)
  const running = refreshPromises.get(cacheKey);
  if (running) {
    return running;
  }

  const refreshPromise = refreshLiveData(cacheKey)
    .then((data) => {
      cache.set(cacheKey, { data, updatedAt: Date.now() });
      refreshPromises.delete(cacheKey);
      return data;
    })
    .catch((err) => {
      refreshPromises.delete(cacheKey);
      // 캐시가 있으면 stale 데이터라도 반환
      if (cached) return cached.data;
      throw err;
    });

  refreshPromises.set(cacheKey, refreshPromise);
  return refreshPromise;
}

// ─── 캐시 프리워밍 ──────────────────────────────────────────────────
// 서버 기동 후 주기적으로 캐시를 갱신해 사용자 요청이 항상 캐시 히트하도록 한다.
const PREWARM_INTERVAL_MS = 25_000; // TTL(30s)보다 짧게 설정

setInterval(() => {
  getLiveData("liveOnly").catch(() => {});
  getLiveData("all").catch(() => {});
}, PREWARM_INTERVAL_MS);

// 모듈 로드 시 즉시 1회 프리워밍
getLiveData("liveOnly").catch(() => {});
getLiveData("all").catch(() => {});

// ─── Route Handler ──────────────────────────────────────────────────

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const liveOnly = searchParams.get("liveOnly") === "1";
        const responseData = await getLiveData(liveOnly ? "liveOnly" : "all");
        return NextResponse.json(responseData, {
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
