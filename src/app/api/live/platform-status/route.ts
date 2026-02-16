import { NextResponse } from "next/server";

type Platform = "chzzk" | "soop";

// 문자열/숫자 혼합으로 내려오는 시청자 수를 안전하게 number로 변환한다.
function parseNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

// 플랫폼 응답 이미지 URL을 브라우저에서 바로 쓸 수 있는 형태로 정규화한다.
function normalizeImageUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;

  let normalized = value.trim();
  if (!normalized) return null;

  if (normalized.startsWith("//")) {
    normalized = `https:${normalized}`;
  }
  if (normalized.startsWith("http://")) {
    normalized = normalized.replace(/^http:\/\//i, "https://");
  }

  // 일부 썸네일 URL은 템플릿 토큰을 포함할 수 있어 기본 해상도 값으로 치환
  normalized = normalized
    .replace(/\{type\}/gi, "f320_180")
    .replace(/\{width\}/gi, "640")
    .replace(/\{height\}/gi, "360");

  // 토큰이 남아있으면 브라우저에서 깨지는 URL이므로 사용하지 않음
  if (/[{}]/.test(normalized)) {
    return null;
  }

  return normalized;
}

// open/v1/lives 페이지 응답에서 특정 channelId의 live row를 찾는다.
function pickChzzkLive(raw: unknown, channelId: string) {
  const data = raw as Record<string, unknown> | null;
  if (!data) return null;

  const content = data.content as Record<string, unknown> | unknown[] | undefined;

  let candidates: unknown[] = [];

  if (content && !Array.isArray(content)) {
    const nestedData = content.data as unknown[] | undefined;
    if (Array.isArray(nestedData)) {
      candidates = nestedData;
    }
  } else if (Array.isArray(content)) {
    candidates = content;
  }

  if (!candidates.length) {
    const topData = data.data as unknown[] | undefined;
    if (Array.isArray(topData)) {
      candidates = topData;
    }
  }

  const normalizedTarget = channelId.trim().toLowerCase();
  const matched = candidates.find((item) => {
    const row = item as Record<string, unknown> | null;
    if (!row) return false;
    const sourceId =
      row.channelId ?? row.channelID ?? row.id ?? row.channel_id ?? "";
    return String(sourceId).trim().toLowerCase() === normalizedTarget;
  });

  if (matched) {
    return matched as Record<string, unknown>;
  }

  if (candidates.length === 1) {
    return candidates[0] as Record<string, unknown>;
  }

  return null;
}

// CHZZK 응답 포맷 차이를 흡수해 live 배열만 추출한다.
function pickChzzkLives(raw: unknown) {
  const data = raw as Record<string, unknown> | null;
  if (!data) return [] as Record<string, unknown>[];

  const content = data.content as Record<string, unknown> | unknown[] | undefined;

  if (content && !Array.isArray(content)) {
    const nestedData = content.data as unknown[] | undefined;
    if (Array.isArray(nestedData)) {
      return nestedData.filter(Boolean) as Record<string, unknown>[];
    }
  }

  if (Array.isArray(content)) {
    return content.filter(Boolean) as Record<string, unknown>[];
  }

  const topData = data.data as unknown[] | undefined;
  if (Array.isArray(topData)) {
    return topData.filter(Boolean) as Record<string, unknown>[];
  }

  return [] as Record<string, unknown>[];
}

// 페이지네이션 커서(next) 위치가 포맷마다 달라서 안전하게 읽어온다.
function pickNextCursor(raw: unknown): string | null {
  const data = raw as Record<string, unknown> | null;
  if (!data) return null;

  const content = data.content as Record<string, unknown> | undefined;
  const pageFromContent = content?.page as Record<string, unknown> | undefined;
  const nextFromContent = pageFromContent?.next;
  if (typeof nextFromContent === "string" && nextFromContent.trim()) {
    return nextFromContent;
  }

  const pageFromTop = data.page as Record<string, unknown> | undefined;
  const nextFromTop = pageFromTop?.next;
  if (typeof nextFromTop === "string" && nextFromTop.trim()) {
    return nextFromTop;
  }

  return null;
}

async function fetchChzzkLiveStatus(channelId: string) {
  const liveUrl = `https://chzzk.naver.com/live/${channelId}`;

  try {
    const headers: HeadersInit = {};
    const clientId =
      process.env.CHZZK_CLIENT_ID || process.env.NEXT_PUBLIC_CHZZK_CLIENT_ID;

    if (clientId) {
      headers["Client-Id"] = clientId;
    }
    if (process.env.CHZZK_CLIENT_SECRET) {
      headers["Client-Secret"] = process.env.CHZZK_CLIENT_SECRET;
    }

    // /open/v1/lives는 channelId 직접 조회가 없어 next 커서를 순회해 매칭한다.
    const maxPages = 30;
    let pageCount = 0;
    let nextCursor: string | null = null;
    let live: Record<string, unknown> | null = null;

    while (pageCount < maxPages) {
      const query = nextCursor
        ? `size=20&next=${encodeURIComponent(nextCursor)}`
        : "size=20";

      const response = await fetch(
        `https://openapi.chzzk.naver.com/open/v1/lives?${query}`,
        {
          method: "GET",
          headers,
          cache: "no-store",
        }
      );

      if (!response.ok) {
        return {
          isLive: false,
          viewerCount: null,
          liveTitle: null,
          liveThumbnailImageUrl: null,
          liveUrl,
        };
      }

      const payload = await response.json();
      const candidates = pickChzzkLives(payload);
      live = pickChzzkLive({ content: { data: candidates } }, channelId);
      if (live) {
        break;
      }

      nextCursor = pickNextCursor(payload);
      if (!nextCursor) {
        break;
      }

      pageCount += 1;
    }

    const statusText = String(
      live?.status ?? live?.liveStatus ?? live?.live?.status ?? ""
    ).toUpperCase();
    const viewerCount = parseNumber(
      live?.concurrentUserCount ?? live?.viewerCount ?? live?.watchingCount
    );
    const liveTitle =
      (live?.liveTitle as string | undefined) ||
      (live?.title as string | undefined) ||
      null;
    const liveThumbnailImageUrl =
      normalizeImageUrl(live?.liveThumbnailImageUrl) ||
      normalizeImageUrl(live?.thumbnailImageUrl) ||
      normalizeImageUrl(live?.thumbnailUrl);

    // 목록에서 채널을 찾았으면 라이브로 판단한다.
    const isLive =
      Boolean(live) ||
      live?.openLive === true ||
      statusText === "OPEN" ||
      statusText === "LIVE";

    return {
      isLive,
      viewerCount,
      liveTitle,
      liveThumbnailImageUrl,
      liveUrl,
    };
  } catch {
    return {
      isLive: false,
      viewerCount: null,
      liveTitle: null,
      liveThumbnailImageUrl: null,
      liveUrl,
    };
  }
}

// SOOP은 공식 공개 API 대신 페이지 메타/스크립트에서 최소 상태만 파싱한다.
function parseSoopMetaTitle(html: string) {
  const titleMatch = html.match(
    /<meta\s+property=["']og:title["']\s+content=["']([^"']*)["']/i
  );
  return titleMatch?.[1] || null;
}

function parseSoopViewerCount(html: string): number | null {
  const patterns = [
    /"concurrentUserCount"\s*:\s*(\d+)/i,
    /"viewerCount"\s*:\s*(\d+)/i,
    /"current_viewer"\s*:\s*"?(\d+)/i,
    /"view_cnt"\s*:\s*"?(\d+)/i,
  ];

  for (const pattern of patterns) {
    const matched = html.match(pattern);
    if (matched?.[1]) {
      const value = Number(matched[1]);
      if (Number.isFinite(value)) return value;
    }
  }
  return null;
}

function parseSoopLiveState(html: string) {
  const livePatterns = [
    /"is_live"\s*:\s*"?1"?/i,
    /"isOnAir"\s*:\s*true/i,
    /"onair"\s*:\s*true/i,
    /"broad_status"\s*:\s*"ON"/i,
  ];

  if (livePatterns.some((pattern) => pattern.test(html))) {
    return true;
  }

  return false;
}

async function fetchSoopLiveStatus(stationId: string) {
  const liveUrl = `https://www.sooplive.co.kr/station/${stationId}`;

  try {
    const response = await fetch(liveUrl, { cache: "no-store" });
    if (!response.ok) {
      return {
        isLive: false,
        viewerCount: null,
        liveTitle: null,
        liveThumbnailImageUrl: null,
        liveUrl,
      };
    }

    const html = await response.text();
    const ogTitle = parseSoopMetaTitle(html);
    const viewerCount = parseSoopViewerCount(html);
    const isLive = parseSoopLiveState(html) || (viewerCount ?? 0) > 0;

    return {
      isLive,
      viewerCount,
      liveTitle: ogTitle,
      liveThumbnailImageUrl: null,
      liveUrl,
    };
  } catch {
    return {
      isLive: false,
      viewerCount: null,
      liveTitle: null,
      liveThumbnailImageUrl: null,
      liveUrl,
    };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform") as Platform | null;
  const id = searchParams.get("id");

  // 클라이언트에서 platform/id가 없으면 즉시 400 처리한다.
  if (!platform || !id || (platform !== "chzzk" && platform !== "soop")) {
    return NextResponse.json(
      { message: "Invalid platform or id" },
      { status: 400 }
    );
  }

  const result =
    platform === "chzzk"
      ? await fetchChzzkLiveStatus(id)
      : await fetchSoopLiveStatus(id);

  return NextResponse.json(result);
}
