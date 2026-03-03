import type { AggregatePeriod, AggregateRankPeriodKey } from "@/types/aggregate-rank";

export function getKstNowParts() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());

  const year = Number(parts.find((part) => part.type === "year")?.value || "2026");
  const month = Number(parts.find((part) => part.type === "month")?.value || "1");
  return { year, month };
}

export function formatDateTimeLabel(value: string) {
  return new Date(value).toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export function getYearOptions(periodKeys: AggregateRankPeriodKey[]) {
  return Array.from(new Set(periodKeys.map((row) => row.year))).sort((a, b) => b - a);
}

export function getMonthOptions(
  period: AggregatePeriod,
  periodKeys: AggregateRankPeriodKey[],
  selectedYear?: number
) {
  if (period === "yearly" || !selectedYear) return [];
  return Array.from(
    new Set(
      periodKeys
        .filter((row) => row.year === selectedYear && row.month > 0)
        .map((row) => row.month)
    )
  ).sort((a, b) => a - b);
}

export function getWeekOptions(
  period: AggregatePeriod,
  periodKeys: AggregateRankPeriodKey[],
  selectedYear?: number,
  selectedMonth?: number
) {
  if (period !== "weekly" || !selectedYear || !selectedMonth) return [];
  return Array.from(
    new Set(
      periodKeys
        .filter(
          (row) =>
            row.year === selectedYear && row.month === selectedMonth && row.week_of_month > 0
        )
        .map((row) => row.week_of_month)
    )
  ).sort((a, b) => a - b);
}

export function isSelectionReady(
  period: AggregatePeriod,
  yearOptions: number[],
  selectedYear?: number,
  monthOptions: number[] = [],
  selectedMonth?: number,
  weekOptions: number[] = [],
  selectedWeekOfMonth?: number
) {
  if (yearOptions.length === 0 || !selectedYear) return false;
  if (period === "yearly") return true;
  if (monthOptions.length === 0 || !selectedMonth) return false;
  if (period === "monthly") return true;
  return Boolean(weekOptions.length > 0 && selectedWeekOfMonth);
}
