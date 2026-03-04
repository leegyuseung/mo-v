export type GiftBoxWindow = {
  dateKey: string;
  windowStartHour: "00" | "12";
  windowKey: string;
  windowLabel: string;
};

function getPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) {
  return parts.find((part) => part.type === type)?.value ?? "";
}

/**
 * KST 기준 현재 선물 이벤트 회차를 계산한다.
 * - 00:00 ~ 11:59 => 오전 회차(00)
 * - 12:00 ~ 23:59 => 오후 회차(12)
 */
export function getCurrentKstGiftBoxWindow(baseDate = new Date()): GiftBoxWindow {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(baseDate);
  const year = getPart(parts, "year");
  const month = getPart(parts, "month");
  const day = getPart(parts, "day");
  const hour = Number(getPart(parts, "hour"));
  const dateKey = `${year}-${month}-${day}`;
  const windowStartHour: "00" | "12" = hour < 12 ? "00" : "12";

  return {
    dateKey,
    windowStartHour,
    windowKey: `${dateKey}-${windowStartHour}`,
    windowLabel: windowStartHour === "00" ? "오전 회차" : "오후 회차",
  };
}

