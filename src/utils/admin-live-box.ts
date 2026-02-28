import type { Streamer } from "@/types/streamer";
import type { LiveBoxStatus } from "@/types/live-box";
import type { LiveBoxParticipantCandidate } from "@/types/admin-live-box";
import { toSeoulDateParts } from "@/utils/seoul-time";

export function formatLiveBoxDate(value: string | null) {
  if (!value) return "-";
  const date = toSeoulDateParts(value);
  if (!date) return "-";
  const year = date.year;
  const month = String(date.month).padStart(2, "0");
  const day = String(date.day).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatLiveBoxDateTime(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
}

export function normalizeLiveBoxStatus(value: string): LiveBoxStatus {
  if (value === "진행중") return "진행중";
  if (value === "종료") return "종료";
  return "대기";
}

export function parseLiveBoxCategoryInput(raw: string): string[] {
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

/**
 * 라이브박스 참여자로 사용할 플랫폼 ID를 결정한다.
 * 왜: 라이브박스는 플랫폼 ID 배열을 저장하므로 스트리머별 우선순위를 고정해야 한다.
 */
export function getLiveBoxParticipantCandidate(
  streamer: Streamer
): LiveBoxParticipantCandidate | null {
  const normalizedPlatform = (streamer.platform || "").trim().toLowerCase();

  if (normalizedPlatform === "soop" && streamer.soop_id) {
    return {
      streamerId: streamer.id,
      platformId: streamer.soop_id,
      platformLabel: "SOOP",
      nickname: streamer.nickname,
    };
  }

  if (normalizedPlatform === "chzzk" && streamer.chzzk_id) {
    return {
      streamerId: streamer.id,
      platformId: streamer.chzzk_id,
      platformLabel: "CHZZK",
      nickname: streamer.nickname,
    };
  }

  if (streamer.soop_id) {
    return {
      streamerId: streamer.id,
      platformId: streamer.soop_id,
      platformLabel: "SOOP",
      nickname: streamer.nickname,
    };
  }

  if (streamer.chzzk_id) {
    return {
      streamerId: streamer.id,
      platformId: streamer.chzzk_id,
      platformLabel: "CHZZK",
      nickname: streamer.nickname,
    };
  }

  return null;
}
