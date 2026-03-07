import type { LiveStreamerStatus } from "@/types/live";
import type {
  ChzzkLiveListItem,
  ChzzkLiveListResponse,
  OfficialLivePlatform,
  PlatformLiveCacheEntry,
  SoopBroadListItem,
  SoopBroadListResponse,
} from "@/types/official-live";

const CHZZK_OPEN_API_BASE_URL = "https://openapi.chzzk.naver.com";
const SOOP_OPEN_API_BASE_URL = "https://openapi.sooplive.co.kr";
const PLATFORM_LIVE_CACHE_TTL_MS = 30_000;
const CHZZK_PAGE_SIZE = 20;
const CHZZK_MAX_PAGE_COUNT = 500;
const SOOP_PAGE_CONCURRENCY = 6;

const platformLiveCache = new Map<OfficialLivePlatform, PlatformLiveCacheEntry>();
const platformRefreshPromises = new Map<
  OfficialLivePlatform,
  Promise<Map<string, LiveStreamerStatus>>
>();

function toNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeImageUrl(value: unknown): string | null {
  const raw = toNullableString(value);
  if (!raw) return null;

  let normalized = raw;
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

function getChzzkClientId() {
  return process.env.CHZZK_CLIENT_ID || null;
}

function getChzzkClientSecret() {
  return process.env.CHZZK_CLIENT_SECRET || null;
}

function getSoopClientId() {
  return process.env.SOOP_API_CLIENT_ID || process.env.SOOP_CLIENT_ID || null;
}

function pickChzzkLiveItems(payload: ChzzkLiveListResponse): ChzzkLiveListItem[] {
  const nested = payload.content?.data;
  if (Array.isArray(nested)) {
    return nested as ChzzkLiveListItem[];
  }

  if (Array.isArray(payload.data)) {
    return payload.data as ChzzkLiveListItem[];
  }

  return [];
}

function pickChzzkNextToken(payload: ChzzkLiveListResponse) {
  return toNullableString(payload.content?.page?.next ?? payload.page?.next);
}

function buildChzzkLiveUrl(channelId: string | null) {
  if (!channelId) return null;
  return `https://chzzk.naver.com/live/${encodeURIComponent(channelId)}`;
}

function buildSoopLiveUrl(userId: string | null, broadNo: string | null) {
  if (!userId || !broadNo) return null;
  return `https://play.sooplive.co.kr/${encodeURIComponent(userId)}/${encodeURIComponent(
    broadNo
  )}`;
}

function normalizeChzzkLiveItem(
  item: ChzzkLiveListItem
): [string, LiveStreamerStatus] | null {
  const channelId = toNullableString(item.channelId);
  if (!channelId) return null;

  return [
    channelId,
    {
      // 공식 open/v1/lives 응답은 "현재 진행 중인 라이브 목록"이므로
      // 응답에 포함된 항목은 모두 라이브 중으로 간주한다.
      isLive: true,
      viewerCount: parseNumber(item.concurrentUserCount),
      liveTitle: toNullableString(item.liveTitle),
      liveThumbnailImageUrl:
        normalizeImageUrl(item.liveThumbnailImageUrl) ||
        normalizeImageUrl(item.liveImageUrl) ||
        normalizeImageUrl(item.channelImageUrl),
      liveUrl: buildChzzkLiveUrl(channelId),
    },
  ];
}

function normalizeSoopLiveItem(
  item: SoopBroadListItem
): [string, LiveStreamerStatus] | null {
  const userId = toNullableString(item.user_id ?? item.userId);
  if (!userId) return null;

  const broadNo = toNullableString(item.broad_no ?? item.broadNo);

  return [
    userId,
    {
      isLive: true,
      viewerCount: parseNumber(item.total_view_cnt ?? item.totalViewCnt),
      liveTitle: toNullableString(item.broad_title ?? item.broadTitle),
      liveThumbnailImageUrl: normalizeImageUrl(item.broad_thumb ?? item.broadThumb),
      liveUrl: buildSoopLiveUrl(userId, broadNo),
    },
  ];
}

async function fetchChzzkLiveListPage(nextToken?: string | null) {
  const clientId = getChzzkClientId();
  const clientSecret = getChzzkClientSecret();
  if (!clientId || !clientSecret) {
    return { items: [], next: null };
  }

  const url = new URL(`${CHZZK_OPEN_API_BASE_URL}/open/v1/lives`);
  url.searchParams.set("size", String(CHZZK_PAGE_SIZE));
  if (nextToken) {
    url.searchParams.set("next", nextToken);
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
    headers: {
      "Client-Id": clientId,
      "Client-Secret": clientSecret,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch CHZZK lives: ${response.status}`);
  }

  const payload = (await response.json()) as ChzzkLiveListResponse;
  return {
    items: pickChzzkLiveItems(payload),
    next: pickChzzkNextToken(payload),
  };
}

async function fetchSoopBroadListPage(pageNo: number): Promise<SoopBroadListResponse> {
  const clientId = getSoopClientId();
  if (!clientId) {
    return { broad: [], page_block: 60, total_cnt: 0 };
  }

  const url = new URL(`${SOOP_OPEN_API_BASE_URL}/broad/list`);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("order_type", "broad_start");
  url.searchParams.set("page_no", String(pageNo));

  const response = await fetch(url.toString(), {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch SOOP broad list: ${response.status}`);
  }

  return (await response.json()) as SoopBroadListResponse;
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

async function refreshChzzkLiveStatusMap() {
  const statusByChannelId = new Map<string, LiveStreamerStatus>();
  let nextToken: string | null = null;
  let pageCount = 0;

  do {
    const page = await fetchChzzkLiveListPage(nextToken);
    page.items.forEach((item) => {
      const normalized = normalizeChzzkLiveItem(item);
      if (normalized) {
        statusByChannelId.set(normalized[0], normalized[1]);
      }
    });

    nextToken = page.next;
    pageCount += 1;
  } while (nextToken && pageCount < CHZZK_MAX_PAGE_COUNT);

  return statusByChannelId;
}

async function refreshSoopLiveStatusMap() {
  const firstPage = await fetchSoopBroadListPage(1);
  const firstItems = Array.isArray(firstPage.broad)
    ? (firstPage.broad as SoopBroadListItem[])
    : [];

  const statusByUserId = new Map<string, LiveStreamerStatus>();

  firstItems.forEach((item) => {
    const normalized = normalizeSoopLiveItem(item);
    if (normalized) {
      statusByUserId.set(normalized[0], normalized[1]);
    }
  });

  const totalCount = parseNumber(firstPage.total_cnt) ?? firstItems.length;
  const pageBlock = Math.max(parseNumber(firstPage.page_block) ?? 60, 1);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageBlock));

  if (totalPages > 1) {
    const remainingPages = Array.from({ length: totalPages - 1 }, (_, index) => index + 2);
    const pageResponses = await mapWithConcurrency(
      remainingPages,
      SOOP_PAGE_CONCURRENCY,
      (pageNo) => fetchSoopBroadListPage(pageNo)
    );

    pageResponses.forEach((pageResponse) => {
      const items = Array.isArray(pageResponse.broad)
        ? (pageResponse.broad as SoopBroadListItem[])
        : [];

      items.forEach((item) => {
        const normalized = normalizeSoopLiveItem(item);
        if (normalized) {
          statusByUserId.set(normalized[0], normalized[1]);
        }
      });
    });
  }

  return statusByUserId;
}

async function getCachedPlatformLiveMap(
  platform: OfficialLivePlatform,
  refresher: () => Promise<Map<string, LiveStreamerStatus>>
) {
  const cached = platformLiveCache.get(platform);
  const now = Date.now();

  if (cached && now - cached.updatedAt < PLATFORM_LIVE_CACHE_TTL_MS) {
    return cached.data;
  }

  const running = platformRefreshPromises.get(platform);
  if (running) {
    return running;
  }

  const refreshPromise = refresher()
    .then((data) => {
      platformLiveCache.set(platform, { data, updatedAt: Date.now() });
      platformRefreshPromises.delete(platform);
      return data;
    })
    .catch((error) => {
      platformRefreshPromises.delete(platform);
      const stale = platformLiveCache.get(platform);
      if (stale) {
        return stale.data;
      }
      throw error;
    });

  platformRefreshPromises.set(platform, refreshPromise);
  return refreshPromise;
}

export function buildChzzkOfflineStatus(channelId: string | null): LiveStreamerStatus {
  return {
    isLive: false,
    viewerCount: null,
    liveTitle: null,
    liveThumbnailImageUrl: null,
    liveUrl: buildChzzkLiveUrl(channelId),
  };
}

export function buildSoopOfflineStatus(soopId: string | null): LiveStreamerStatus {
  return {
    isLive: false,
    viewerCount: null,
    liveTitle: null,
    liveThumbnailImageUrl: null,
    liveUrl: soopId ? `https://ch.sooplive.co.kr/${encodeURIComponent(soopId)}` : null,
  };
}

export function getChzzkLiveStatusMap() {
  return getCachedPlatformLiveMap("chzzk", refreshChzzkLiveStatusMap);
}

export function getSoopLiveStatusMap() {
  return getCachedPlatformLiveMap("soop", refreshSoopLiveStatusMap);
}

export async function getOfficialPlatformLiveMaps() {
  const [chzzk, soop] = await Promise.all([
    getChzzkLiveStatusMap(),
    getSoopLiveStatusMap(),
  ]);

  return { chzzk, soop };
}
