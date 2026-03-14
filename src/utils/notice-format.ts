import type { NoticeCategory } from "@/types/notice";

export function getNoticeCategoryLabel(category: NoticeCategory) {
  return category === "event" ? "이벤트" : "공지";
}

export function getNoticeCategoryBadgeClassName(category: NoticeCategory) {
  if (category === "event") {
    return "bg-rose-50 text-rose-700";
  }

  return "bg-blue-50 text-blue-700";
}

export function formatNoticeListDate(value: string | null) {
  if (!value) return "-";

  const targetDate = new Date(value);
  const now = new Date();
  const isToday =
    targetDate.getFullYear() === now.getFullYear() &&
    targetDate.getMonth() === now.getMonth() &&
    targetDate.getDate() === now.getDate();

  if (isToday) {
    return targetDate.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, "0");
  const day = String(targetDate.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

export function formatNoticeDateTime(value: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatNoticeViewCount(value: number) {
  if (value > 99_990_000) {
    return "9999만+";
  }

  if (value >= 10_000) {
    return `${Math.floor(value / 10_000).toLocaleString("ko-KR")}만`;
  }

  return value.toLocaleString("ko-KR");
}

export function getNoticePlainText(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function getNoticeDescription(html: string, maxLength = 140) {
  const text = getNoticePlainText(html);
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
}
