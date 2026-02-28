import type { LiveStatusByStreamerId, LiveStreamer } from "@/types/live";

/**
 * 서버에서 일괄 조회·캐시된 라이브 스트리머 목록을 가져온다.
 * /api/live/all Route Handler가 30초 TTL 캐시를 관리하므로
 * 클라이언트는 단 1건의 fetch만 수행한다.
 */
export async function fetchLiveStreamers(): Promise<LiveStreamer[]> {
  const response = await fetch("/api/live/all");
  if (!response.ok) {
    throw new Error(`Failed to fetch live streamers: ${response.status}`);
  }
  return response.json();
}

export async function fetchLiveStreamerStatusesByIds(
  streamerIds: number[]
): Promise<LiveStatusByStreamerId> {
  if (streamerIds.length === 0) {
    return {};
  }

  const response = await fetch("/api/live/status-by-ids", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ids: streamerIds }),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch live streamer statuses: ${response.status}`);
  }

  return response.json();
}
