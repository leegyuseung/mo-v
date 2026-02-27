import type { ScheduleCalendarProps, ScheduleHoverCardProps } from "@/types/contents-detail";

const WEEK_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatDateRange(start: string | null, end: string | null) {
  const startLabel = start ? formatDate(start) : "미입력";
  const endLabel = end ? formatDate(end) : "미입력";
  return `${startLabel} ~ ${endLabel}`;
}

function toDateOnly(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getMonthCells(monthDate: Date) {
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

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function formatMonthLabel(monthDate: Date) {
  return `${monthDate.getFullYear()}.${String(monthDate.getMonth() + 1).padStart(2, "0")}`;
}

function isSameDate(left: Date | null, right: Date | null) {
  if (!left || !right) return false;
  return left.getTime() === right.getTime();
}

function isInRange(target: Date | null, start: Date | null, end: Date | null) {
  if (!target || !start || !end) return false;
  return target.getTime() >= start.getTime() && target.getTime() <= end.getTime();
}

function ScheduleCalendar({ label, start, end, tone }: ScheduleCalendarProps) {
  const parsedStart = toDateOnly(start);
  const parsedEnd = toDateOnly(end);
  const hasRange = Boolean(parsedStart && parsedEnd);

  const startDate =
    hasRange && parsedStart && parsedEnd && parsedStart.getTime() > parsedEnd.getTime()
      ? parsedEnd
      : parsedStart;
  const endDate =
    hasRange && parsedStart && parsedEnd && parsedStart.getTime() > parsedEnd.getTime()
      ? parsedStart
      : parsedEnd;

  const displayMonths: Date[] = [];
  if (startDate && endDate) {
    const startMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const endMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    displayMonths.push(startMonth);
    if (startMonth.getTime() !== endMonth.getTime()) {
      displayMonths.push(endMonth);
    }
  } else if (parsedStart || parsedEnd) {
    const base = parsedStart || parsedEnd;
    if (base) {
      displayMonths.push(new Date(base.getFullYear(), base.getMonth(), 1));
    }
  }

  const toneRangeClass =
    tone === "blue" ? "bg-blue-100 text-blue-800" : "bg-emerald-100 text-emerald-800";
  const toneEdgeClass =
    tone === "blue" ? "bg-blue-600 text-white" : "bg-emerald-600 text-white";

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
      <p className="text-xs font-medium text-gray-600">{label}</p>
      <p className="mt-1 text-xs text-gray-500">{formatDateRange(start, end)}</p>

      {displayMonths.length > 0 ? (
        <div className="mt-3 grid grid-cols-1 gap-3">
          {displayMonths.map((month) => {
            const cells = getMonthCells(month);

            return (
              <div
                key={`${label}-${month.getFullYear()}-${month.getMonth()}`}
                className="rounded-lg border border-gray-200 bg-white p-2"
              >
                <p className="mb-2 text-center text-xs font-semibold text-gray-700">
                  {formatMonthLabel(month)}
                </p>
                <div className="grid grid-cols-7 gap-1">
                  {WEEK_LABELS.map((weekLabel) => (
                    <span
                      key={`${label}-${month.getMonth()}-${weekLabel}`}
                      className="flex h-6 items-center justify-center text-[10px] text-gray-500"
                    >
                      {weekLabel}
                    </span>
                  ))}
                  {cells.map((cell, index) => {
                    const inRange = isInRange(cell, startDate, endDate);
                    const isStart = isSameDate(cell, startDate);
                    const isEnd = isSameDate(cell, endDate);

                    return (
                      <span
                        key={`${label}-${month.getMonth()}-day-${index}`}
                        className={`flex h-6 items-center justify-center rounded text-[10px] ${cell ? "text-gray-700" : "text-transparent"} ${inRange ? toneRangeClass : "bg-white"} ${isStart || isEnd ? toneEdgeClass : ""}`}
                      >
                        {cell ? cell.getDate() : "."}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-3 rounded-lg border border-dashed border-gray-200 bg-white px-3 py-4 text-center text-xs text-gray-400">
          일정 정보가 없습니다.
        </p>
      )}
    </div>
  );
}

export default function ContentsDetailScheduleHoverCard({
  label,
  start,
  end,
  tone,
}: ScheduleHoverCardProps) {
  const toneClass =
    tone === "blue"
      ? "border-blue-200 bg-blue-50 text-blue-700"
      : "border-emerald-200 bg-emerald-50 text-emerald-700";

  return (
    <div className="group relative" tabIndex={0}>
      <div className="cursor-default rounded-lg border border-gray-200 bg-white px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${toneClass}`}>
            {label}
          </span>
        </div>
        <p className="mt-1 text-xs text-gray-600">{formatDateRange(start, end)}</p>
      </div>

      <div className="pointer-events-none absolute left-0 top-full z-30 mt-2 w-[min(360px,calc(100vw-2.5rem))] translate-y-1 opacity-0 transition-all duration-150 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
        <div className="rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
          <ScheduleCalendar label={label} start={start} end={end} tone={tone} />
        </div>
      </div>
    </div>
  );
}
