import type { LiveBoxSortDirection, LiveBoxSortKey } from "@/types/live-box-screen";

export function formatLiveBoxDisplayDate(value: string | null, fallback = "미설정") {
  if (!value) return fallback;

  return new Date(value).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function getLiveBoxDefaultSortDirection(
  sortKey: LiveBoxSortKey
): LiveBoxSortDirection {
  if (sortKey === "title") return "asc";
  return "desc";
}
