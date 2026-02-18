import { NextResponse } from "next/server";

type Platform = "chzzk";

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

  if (normalized.startsWith("//")) {
    normalized = `https:${normalized}`;
  }
  if (normalized.startsWith("http://")) {
    normalized = normalized.replace(/^http:\/\//i, "https://");
  }

  normalized = normalized
    .replace(/\{type\}/gi, "f320_180")
    .replace(/\{width\}/gi, "640")
    .replace(/\{height\}/gi, "360");

  if (/[{}]/.test(normalized)) {
    return null;
  }

  return normalized;
}

async function fetchChzzkLiveStatusByChannelId(channelId: string) {
  const liveUrl = `https://chzzk.naver.com/live/${channelId}`;

  try {
    const response = await fetch(
      `https://api.chzzk.naver.com/polling/v3.1/channels/${encodeURIComponent(
        channelId
      )}/live-status`,
      {
        method: "GET",
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

    const payload = (await response.json()) as Record<string, unknown>;
    const content = (payload.content ??
      payload.data ??
      payload) as Record<string, unknown>;

    const statusText = String(
      content.status ?? content.liveStatus ?? ""
    ).toUpperCase();

    const viewerCount = parseNumber(
      content.concurrentUserCount ?? content.viewerCount ?? content.watchingCount
    );

    const liveTitle =
      (content.liveTitle as string | undefined) ||
      (content.title as string | undefined) ||
      null;

    const liveThumbnailImageUrl =
      normalizeImageUrl(content.liveThumbnailImageUrl) ||
      normalizeImageUrl(content.thumbnailImageUrl) ||
      normalizeImageUrl(content.thumbnailUrl);

    const isLive =
      statusText === "OPEN" ||
      statusText === "LIVE" ||
      content.openLive === true;

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform") as Platform | null;
  const id = searchParams.get("id");

  if (!platform || platform !== "chzzk" || !id) {
    return NextResponse.json(
      { message: "Invalid platform or id" },
      { status: 400 }
    );
  }

  const result = await fetchChzzkLiveStatusByChannelId(id);
  return NextResponse.json(result);
}
