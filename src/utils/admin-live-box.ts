import type { Streamer } from "@/types/streamer";
import type { LiveBoxCreateInput, LiveBoxStatus, LiveBoxUpdateInput } from "@/types/live-box";
import type { LiveBoxParticipantCandidate } from "@/types/admin-live-box";
import { toSeoulDateParts } from "@/utils/seoul-time";

export const LIVE_BOX_EXTERNAL_LINK_REQUIRED_ERROR_MESSAGE =
  "URL 제목과 URL은 함께 입력해 주세요.";
export const LIVE_BOX_EXTERNAL_LINK_FORMAT_ERROR_MESSAGE =
  "URL은 http:// 또는 https:// 형식이어야 합니다.";

const HTTP_URL_PATTERN = /^https?:\/\//i;

export type LiveBoxExternalLinkInput = {
  urlTitle?: string | null;
  url?: string | null;
};

export function normalizeLiveBoxExternalLink({
  urlTitle,
  url,
}: LiveBoxExternalLinkInput) {
  return {
    urlTitle: urlTitle?.trim() || "",
    url: url?.trim() || "",
  };
}

/**
 * 라이브박스 외부 링크 입력값이 저장 가능한 상태인지 확인한다.
 * 왜: 관리자 폼과 API에서 동일 규칙을 공유해 검증 결과를 일관되게 유지하기 위함.
 */
export function validateLiveBoxExternalLink(input: LiveBoxExternalLinkInput): string | null {
  const normalized = normalizeLiveBoxExternalLink(input);

  if ((normalized.urlTitle && !normalized.url) || (!normalized.urlTitle && normalized.url)) {
    return LIVE_BOX_EXTERNAL_LINK_REQUIRED_ERROR_MESSAGE;
  }

  if (normalized.url && !HTTP_URL_PATTERN.test(normalized.url)) {
    return LIVE_BOX_EXTERNAL_LINK_FORMAT_ERROR_MESSAGE;
  }

  return null;
}

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

function toTimestampOrNull(value: string | null) {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
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

export function buildLiveBoxParticipantCandidates(streamers: Streamer[]) {
  return streamers
    .map(getLiveBoxParticipantCandidate)
    .filter((item): item is LiveBoxParticipantCandidate => item !== null);
}

/**
 * 클라이언트 조작으로 잘못된 payload가 전달돼도 DB 쓰기 전에 1차 검증한다.
 * 왜: 관리자 폼과 승인 API가 같은 규칙을 공유해야 등록 경로가 달라도 결과가 일관되기 때문이다.
 */
export function assertValidLiveBoxPayload(payload: LiveBoxCreateInput | LiveBoxUpdateInput) {
  if (!payload.title.trim()) {
    throw new Error("제목은 필수입니다.");
  }

  if (!Array.isArray(payload.category) || payload.category.length === 0) {
    throw new Error("카테고리를 1개 이상 입력해 주세요.");
  }

  const startsAtTimestamp = toTimestampOrNull(payload.starts_at);
  const endsAtTimestamp = toTimestampOrNull(payload.ends_at);

  if (payload.starts_at && startsAtTimestamp === null) {
    throw new Error("시작일시 형식이 올바르지 않습니다.");
  }

  if (payload.ends_at && endsAtTimestamp === null) {
    throw new Error("종료일시 형식이 올바르지 않습니다.");
  }

  if (
    startsAtTimestamp !== null &&
    endsAtTimestamp !== null &&
    startsAtTimestamp > endsAtTimestamp
  ) {
    throw new Error("시작일시는 종료일시보다 늦을 수 없습니다.");
  }

  const linkValidationMessage = validateLiveBoxExternalLink({
    urlTitle: payload.url_title,
    url: payload.url,
  });
  if (linkValidationMessage) {
    throw new Error(linkValidationMessage);
  }
}

export function toLiveBoxPersistPayload(payload: LiveBoxCreateInput | LiveBoxUpdateInput) {
  const normalizedExternalLink = normalizeLiveBoxExternalLink({
    urlTitle: payload.url_title,
    url: payload.url,
  });

  return {
    title: payload.title,
    category: payload.category,
    participant_streamer_ids: payload.participant_streamer_ids,
    starts_at: payload.starts_at,
    ends_at: payload.ends_at,
    url_title: normalizedExternalLink.urlTitle || null,
    url: normalizedExternalLink.url || null,
    description: payload.description,
    status: payload.status,
  };
}
