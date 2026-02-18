import { createClient } from "@/utils/supabase/client";
import type { LiveStreamer, PlatformLiveStatus } from "@/types/live";

const supabase = createClient();

async function fetchPlatformLiveStatus(
  platform: "chzzk" | "soop",
  id: string
): Promise<PlatformLiveStatus> {
  const response = await fetch(
    `/api/live/platform-status?platform=${platform}&id=${encodeURIComponent(id)}`
  );

  if (!response.ok) {
    return {
      isLive: false,
      viewerCount: null,
      liveTitle: null,
      liveThumbnailImageUrl: null,
      liveUrl:
        platform === "chzzk"
          ? `https://chzzk.naver.com/live/${id}`
          : `https://www.sooplive.co.kr/station/${id}`,
    };
  }

  return response.json();
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  if (items.length === 0) return [];
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  });

  await Promise.all(workers);
  return results;
}

export async function fetchLiveStreamers(): Promise<LiveStreamer[]> {
  const { data: streamers, error } = await supabase
    .from("streamers")
    .select("*")
    .order("nickname", { ascending: true })
    .range(0, 4999);

  if (error) throw error;

  const streamerRows = streamers || [];

  const liveStatuses = await mapWithConcurrency(
    streamerRows,
    12,
    async (streamer): Promise<PlatformLiveStatus> => {
      const platformRaw = String(streamer.platform || "").trim().toLowerCase();
      const platform: "chzzk" | "soop" =
        streamer.chzzk_id
          ? "chzzk"
          : streamer.soop_id
            ? "soop"
            : platformRaw.includes("chzzk") || platformRaw.includes("치지")
              ? "chzzk"
              : "soop";

      if (platform === "soop") {
        return {
          isLive: false,
          viewerCount: null,
          liveTitle: null,
          liveThumbnailImageUrl: null,
          liveUrl: `https://www.sooplive.co.kr/station/${streamer.soop_id || ""}`,
        };
      }

      const platformId = streamer.chzzk_id;
      if (!platformId) {
        return {
          isLive: false,
          viewerCount: null,
          liveTitle: null,
          liveThumbnailImageUrl: null,
          liveUrl: `https://chzzk.naver.com/live/${streamer.chzzk_id || ""}`,
        };
      }

      return fetchPlatformLiveStatus("chzzk", platformId);
    }
  );

  return streamerRows.map((streamer, index) => ({
    ...streamer,
    ...liveStatuses[index],
  }));
}
