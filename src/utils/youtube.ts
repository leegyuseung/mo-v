const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtu.be",
  "www.youtu.be",
]);

/**
 * 다양한 YouTube URL 형식에서 video id를 추출한다.
 * 에디터에서는 embed URL로 정규화해야 미리보기와 저장 포맷을 일관되게 유지할 수 있다.
 */
export function extractYouTubeVideoId(input: string): string | null {
  const trimmedInput = input.trim();
  if (!trimmedInput) return null;

  try {
    const url = new URL(trimmedInput);
    if (!YOUTUBE_HOSTS.has(url.hostname)) return null;

    if (url.hostname.includes("youtu.be")) {
      const shortId = url.pathname.replace(/^\/+/, "").split("/")[0];
      return normalizeYouTubeVideoId(shortId);
    }

    const watchId = url.searchParams.get("v");
    if (watchId) {
      return normalizeYouTubeVideoId(watchId);
    }

    const pathSegments = url.pathname.split("/").filter(Boolean);
    const embedIndex = pathSegments.findIndex((segment) =>
      ["embed", "shorts", "live"].includes(segment)
    );

    if (embedIndex >= 0) {
      return normalizeYouTubeVideoId(pathSegments[embedIndex + 1] || "");
    }

    return null;
  } catch {
    return null;
  }
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

export function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

function normalizeYouTubeVideoId(value: string): string | null {
  const trimmedValue = value.trim();
  return /^[A-Za-z0-9_-]{11}$/.test(trimmedValue) ? trimmedValue : null;
}
