import { fetchStreamers } from "@/api/streamers";
import type { LiveStreamer, PlatformLiveStatus } from "@/types/live";

// 각 스트리머의 플랫폼별 라이브 상태를 내부 API(Route Handler)에서 조회한다.
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

export async function fetchLiveStreamers(): Promise<LiveStreamer[]> {
  // vlist와 동일한 streamers 원본을 사용하고, 라이브 상태만 합성한다.
  const { data: streamers } = await fetchStreamers({
    page: 1,
    pageSize: 1000,
    platform: "all",
    sortOrder: "asc",
    keyword: "",
  });

  const liveStatuses = await Promise.all(
    streamers.map(async (streamer) => {
      const platform = streamer.platform === "chzzk" ? "chzzk" : "soop";

      // SOOP 라이브 조회는 오류 이슈로 비활성화한다.
      // 필요 시 SOOP API 연동 안정화 후 다시 활성화한다.
      if (platform === "soop") {
        return {
          isLive: false,
          viewerCount: null,
          liveTitle: null,
          liveThumbnailImageUrl: null,
          liveUrl: `https://www.sooplive.co.kr/station/${streamer.soop_id || ""}`,
        } as PlatformLiveStatus;
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
        } as PlatformLiveStatus;
      }

      return fetchPlatformLiveStatus(platform, platformId);
    })
  );

  return streamers.map((streamer, index) => ({
    ...streamer,
    ...liveStatuses[index],
  }));
}
