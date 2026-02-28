import type { Content } from "@/types/content";
import type { ContentSortKey, SortDirection } from "@/types/contents-screen";

export const DAY_IN_MS = 24 * 60 * 60 * 1000;
export const NEW_BADGE_WINDOW_IN_MS = 2 * DAY_IN_MS;
export const ITEMS_PER_PAGE = 10;

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function formatDateRange(start: string | null, end: string | null) {
  const startLabel = start ? formatDate(start) : "미입력";
  const endLabel = end ? formatDate(end) : "미입력";
  return `${startLabel} ~ ${endLabel}`;
}

export function getStatusLabel(status: string) {
  if (status === "pending") return "대기중";
  if (status === "approved") return "모집중";
  if (status === "ended") return "마감";
  if (status === "rejected") return "거절";
  if (status === "cancelled") return "취소";
  if (status === "deleted") return "삭제";
  return status;
}

/** approved 상태에서 모집 시작일 이전이면 "모집대기중", 이후면 "모집중" 반환 */
export function getRecruitmentStatusLabel(
  status: string,
  recruitmentStartAt: string | null,
  nowTimestamp: number
): string {
  if (status === "approved" && recruitmentStartAt) {
    const startDate = new Date(recruitmentStartAt);
    startDate.setHours(0, 0, 0, 0);
    const today = new Date(nowTimestamp);
    today.setHours(0, 0, 0, 0);
    if (today.getTime() < startDate.getTime()) {
      return "모집대기중";
    }
  }
  return getStatusLabel(status);
}

export function getStatusClassName(status: string) {
  if (status === "pending") return "border-gray-200 bg-gray-100 text-gray-600";
  if (status === "approved") return "border-green-200 bg-green-50 text-green-700";
  if (status === "ended") return "border-red-200 bg-red-50 text-red-700";
  if (status === "rejected") return "border-red-200 bg-red-50 text-red-700";
  if (status === "cancelled") return "border-gray-200 bg-gray-100 text-gray-600";
  if (status === "deleted") return "border-gray-200 bg-gray-100 text-gray-600";
  return "border-gray-200 bg-gray-100 text-gray-600";
}

/** 모집 마감일까지 남은 D-day 라벨 반환 (D-0이면 "D-day") */
export function getRecruitmentDdayLabel(
  recruitmentEndAt: string | null,
  nowTimestamp: number
): string | null {
  if (!recruitmentEndAt) return null;
  const endDate = new Date(recruitmentEndAt);
  endDate.setHours(0, 0, 0, 0);
  const today = new Date(nowTimestamp);
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil(
    (endDate.getTime() - today.getTime()) / DAY_IN_MS
  );
  if (diffDays < 0) return null;
  if (diffDays === 0) return "D-day";
  return `D-${diffDays}`;
}

export function resolveDeadline(content: Content) {
  return content.recruitment_end_at || null;
}

export function getDefaultSortDirection(sortKey: ContentSortKey): SortDirection {
  if (sortKey === "title" || sortKey === "deadline") return "asc";
  return "desc";
}
