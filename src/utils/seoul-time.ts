const SEOUL_TIME_ZONE = "Asia/Seoul";
const DAY_IN_MS = 24 * 60 * 60 * 1000;

type DateInput = Date | number | string;

function toValidDate(value: DateInput): Date | null {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function getPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) {
  return Number(parts.find((part) => part.type === type)?.value || "0");
}

type SeoulDateParts = {
  year: number;
  month: number;
  day: number;
};

export function toSeoulDateParts(value: DateInput): SeoulDateParts | null {
  const date = toValidDate(value);
  if (!date) return null;

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SEOUL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = getPart(parts, "year");
  const month = getPart(parts, "month");
  const day = getPart(parts, "day");

  if (!year || !month || !day) return null;

  return { year, month, day };
}

export function toSeoulDayIndex(value: DateInput): number | null {
  const parts = toSeoulDateParts(value);
  if (!parts) return null;
  return Math.floor(Date.UTC(parts.year, parts.month - 1, parts.day) / DAY_IN_MS);
}

export function formatSeoulDate(value: DateInput, fallback = "미입력") {
  const date = toValidDate(value);
  if (!date) return fallback;

  return date.toLocaleDateString("ko-KR", {
    timeZone: SEOUL_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function parseDateInput(value: string) {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;

  const validate = new Date(Date.UTC(year, month - 1, day));
  if (
    validate.getUTCFullYear() !== year ||
    validate.getUTCMonth() + 1 !== month ||
    validate.getUTCDate() !== day
  ) {
    return null;
  }

  return { year, month, day };
}

export function toSeoulBoundaryIso(value: string, boundary: "start" | "end"): string | null {
  const parsed = parseDateInput(value);
  if (!parsed) return null;

  const hours = boundary === "start" ? "00:00:00" : "23:59:59";
  return new Date(`${value}T${hours}+09:00`).toISOString();
}

