import type { HistoryFilterOption } from "@/types/history-screen";

export const HISTORY_PAGE_SIZE = 15;

export const HISTORY_FILTER_OPTIONS: HistoryFilterOption[] = [
  { value: "all", label: "전체" },
  { value: "plus", label: "+" },
  { value: "minus", label: "-" },
];

const HISTORY_TYPE_LABELS: Record<string, string> = {
  profile_first_edit: "첫 프로필 수정 보너스",
  daily_gift_box: "일일 선물 이벤트",
  gift_sent: "하트 선물",
  admin_review_reward: "신고 보상",
};

export function getHistoryTypeLabel(type: string | null | undefined) {
  if (!type) return "기타";
  const normalizedType = type.trim().toLowerCase();
  return HISTORY_TYPE_LABELS[normalizedType] || type;
}

export function formatHistoryDate(dateStr: string) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

export function getSeoulDateKey(dateStr: string) {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(dateStr));
}
