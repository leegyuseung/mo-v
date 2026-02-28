import type { LiveBoxSortDirection, LiveBoxSortKey } from "@/types/live-box-screen";
import { formatSeoulDate } from "@/utils/seoul-time";

export function formatLiveBoxDisplayDate(value: string | null, fallback = "미설정") {
  if (!value) return fallback;
  return formatSeoulDate(value, fallback);
}

export function getLiveBoxDefaultSortDirection(
  sortKey: LiveBoxSortKey
): LiveBoxSortDirection {
  if (sortKey === "title") return "asc";
  return "desc";
}
