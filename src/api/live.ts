import { createClient } from "@/utils/supabase/client";
import type { ChzzkLiveListItem, LiveStreamer, PlatformLiveStatus } from "@/types/live";

const supabase = createClient();

async function fetchChzzkLiveStatusByChannelId(
  channelId: string
): Promise<PlatformLiveStatus> {
  const response = await fetch(
    `/api/live/platform-status?platform=chzzk&id=${encodeURIComponent(channelId)}`
  );

  if (!response.ok) {
    return {
      isLive: false,
      viewerCount: null,
      liveTitle: null,
      liveThumbnailImageUrl: null,
      liveUrl: `https://chzzk.naver.com/live/${channelId}`,
    };
  }

  return response.json();
}

async function fetchAllChzzkLiveStatuses(): Promise<Record<string, ChzzkLiveListItem>> {
  const response = await fetch(
    "/api/live/platform-status?platform=chzzk"
  );

  if (!response.ok) {
    return {};
  }

  const payload = (await response.json()) as { items?: ChzzkLiveListItem[] };
  const map: Record<string, ChzzkLiveListItem> = {};
  (payload.items || []).forEach((item) => {
    map[item.channelId.trim().toLowerCase()] = item;
  });
  return map;
}

export async function fetchLiveStreamers(): Promise<LiveStreamer[]> {
  // count 없이 필요한 컬럼만 바로 가져와 초기 조회를 가볍게 만든다.
  const { data: streamers, error } = await supabase
    .from("streamers")
    .select("*")
    .order("nickname", { ascending: true })
    .range(0, 4999);

  if (error) {
    throw error;
  }

  const streamerRows = streamers || [];
  const chzzkStatusById = await fetchAllChzzkLiveStatuses();

  // 전체 목록 응답이 비었을 때 개별 조회로 폴백한다.
  if (Object.keys(chzzkStatusById).length === 0) {
    const fallbackTargets = streamerRows
      .filter((streamer) => streamer.platform === "chzzk" && streamer.chzzk_id)
      .map((streamer) => streamer.chzzk_id as string);

    const fallbackStatuses = await Promise.all(
      fallbackTargets.map(async (channelId) => ({
        channelId: channelId.trim().toLowerCase(),
        status: await fetchChzzkLiveStatusByChannelId(channelId),
      }))
    );

    fallbackStatuses.forEach((item) => {
      chzzkStatusById[item.channelId] = {
        channelId: item.channelId,
        isLive: item.status.isLive,
        viewerCount: item.status.viewerCount,
        liveTitle: item.status.liveTitle,
        liveThumbnailImageUrl: item.status.liveThumbnailImageUrl,
        liveUrl: item.status.liveUrl,
      };
    });
  }

  const liveStatuses = streamerRows.map((streamer) => {
      const platformRaw = String(streamer.platform || "").trim().toLowerCase();
      const platform: "chzzk" | "soop" =
        streamer.chzzk_id
          ? "chzzk"
          : streamer.soop_id
            ? "soop"
            : platformRaw.includes("chzzk") || platformRaw.includes("치지")
              ? "chzzk"
              : "soop";

      // SOOP 라이브 조회는 오류 이슈로 비활성화한다.
      // 필요 시 SOOP API 연동 안정화 후 다시 활성화한다.
      if (platform === "soop") {
        return {
          isLive: false,
          viewerCount: null,
          liveTitle: null,
          liveThumbnailImageUrl: null,
          liveUrl: `https://www.sooplive.co.kr/station/${streamer.soop_id || ""}`,
        } satisfies PlatformLiveStatus;
      }

      const platformId =
        platform === "chzzk" ? streamer.chzzk_id : streamer.soop_id;

      if (!platformId) {
        // 플랫폼 ID가 비어있으면 링크만 유지하고 라이브 상태는 false로 둔다.
        return {
          isLive: false,
          viewerCount: null,
          liveTitle: null,
          liveThumbnailImageUrl: null,
          liveUrl:
            platform === "chzzk"
              ? `https://chzzk.naver.com/live/${streamer.chzzk_id || ""}`
              : `https://www.sooplive.co.kr/station/${streamer.soop_id || ""}`,
        } satisfies PlatformLiveStatus;
      }
      const matched = chzzkStatusById[platformId.trim().toLowerCase()];
      if (!matched) {
        return {
          isLive: false,
          viewerCount: null,
          liveTitle: null,
          liveThumbnailImageUrl: null,
          liveUrl: `https://chzzk.naver.com/live/${platformId}`,
        } satisfies PlatformLiveStatus;
      }

      return {
        // /open/v1/lives 목록에 존재하면 라이브로 본다.
        isLive: true,
        viewerCount: matched.viewerCount,
        liveTitle: matched.liveTitle,
        liveThumbnailImageUrl: matched.liveThumbnailImageUrl,
        liveUrl: matched.liveUrl || `https://chzzk.naver.com/live/${platformId}`,
      } satisfies PlatformLiveStatus;
    });

  return streamerRows.map((streamer, index) => ({
    ...streamer,
    ...liveStatuses[index],
  }));
}
