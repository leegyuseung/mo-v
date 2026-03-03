import type { LiveBox } from "@/types/live-box";
import type { LiveBoxScheduleRange } from "@/types/live-box-schedule-calendar";
import { toSeoulDateParts } from "@/utils/seoul-time";

export const LIVE_BOX_SCHEDULE_WEEK_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

export function toDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(base: Date, amount: number) {
  const next = new Date(base);
  next.setDate(base.getDate() + amount);
  return next;
}

export function isSameDate(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function getMonthCells(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<Date | null> = [];
  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length < 42) {
    cells.push(null);
  }

  return cells;
}

export function formatMonthLabel(value: Date) {
  return `${value.getFullYear()}년 ${value.getMonth() + 1}월`;
}

export function getTodaySeoulDate() {
  const parts = toSeoulDateParts(new Date());
  if (!parts) return new Date();
  return new Date(parts.year, parts.month - 1, parts.day);
}

function toSeoulDateOnly(value: string | null) {
  if (!value) return null;
  const parts = toSeoulDateParts(value);
  if (!parts) return null;
  return new Date(parts.year, parts.month - 1, parts.day);
}

export function buildScheduleRanges(liveBoxes: LiveBox[]): LiveBoxScheduleRange[] {
  return liveBoxes.flatMap((liveBox) => {
    const parsedStart = toSeoulDateOnly(liveBox.starts_at);
    const parsedEnd = toSeoulDateOnly(liveBox.ends_at);
    if (!parsedStart || !parsedEnd) return [];

    const startsAt = parsedStart.getTime() <= parsedEnd.getTime() ? parsedStart : parsedEnd;
    const endsAt = parsedStart.getTime() <= parsedEnd.getTime() ? parsedEnd : parsedStart;

    return [
      {
        id: liveBox.id,
        title: liveBox.title,
        startsAt,
        endsAt,
        startsAtRaw: liveBox.starts_at!,
        endsAtRaw: liveBox.ends_at!,
      },
    ];
  });
}

export function buildDateCountMap(scheduleRanges: LiveBoxScheduleRange[]) {
  const map = new Map<string, number>();

  scheduleRanges.forEach((range) => {
    let cursor = range.startsAt;

    while (cursor.getTime() <= range.endsAt.getTime()) {
      const key = toDateKey(cursor);
      map.set(key, (map.get(key) || 0) + 1);
      cursor = addDays(cursor, 1);
    }
  });

  return map;
}

export function getSelectedSchedules(
  scheduleRanges: LiveBoxScheduleRange[],
  selectedDate: Date
) {
  return scheduleRanges
    .filter(
      (range) =>
        selectedDate.getTime() >= range.startsAt.getTime() &&
        selectedDate.getTime() <= range.endsAt.getTime()
    )
    .sort((left, right) => left.startsAt.getTime() - right.startsAt.getTime());
}
