"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { LiveBoxScheduleCalendarModalProps } from "@/types/live-box-schedule-calendar";
import { formatLiveBoxDisplayDate } from "@/utils/live-box-presenter";
import {
  LIVE_BOX_SCHEDULE_WEEK_LABELS,
  buildDateCountMap,
  buildScheduleRanges,
  formatMonthLabel,
  getMonthCells,
  getSelectedSchedules,
  getTodaySeoulDate,
  isSameDate,
  parseDateKey,
  toDateKey,
} from "@/utils/live-box-schedule-calendar";

export default function LiveBoxScheduleCalendarModal({
  open,
  liveBoxes,
  isLoading,
  onClose,
}: LiveBoxScheduleCalendarModalProps) {
  const today = useMemo(() => getTodaySeoulDate(), []);
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const [selectedDate, setSelectedDate] = useState(today);

  const scheduleRanges = useMemo(() => buildScheduleRanges(liveBoxes), [liveBoxes]);
  const dateCountMap = useMemo(() => buildDateCountMap(scheduleRanges), [scheduleRanges]);

  const selectedDateKey = toDateKey(selectedDate);
  const selectedSchedules = useMemo(
    () => getSelectedSchedules(scheduleRanges, selectedDate),
    [scheduleRanges, selectedDate]
  );

  const monthCells = useMemo(() => getMonthCells(currentMonth), [currentMonth]);
  const monthLabel = formatMonthLabel(currentMonth);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 px-3 py-3 md:items-center md:px-4 md:py-0">
      <div className="w-full max-w-md md:max-w-3xl max-h-[calc(100dvh-1.5rem)] md:max-h-[88vh] overflow-y-auto md:overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 md:p-5 shadow-xl">
        <div className="mb-2 md:mb-4 flex items-start justify-end md:items-center md:justify-between">
          <div className="hidden md:block">
            <h3 className="text-base font-semibold text-gray-900">콘텐츠 일정</h3>
            <p className="mt-0.5 text-xs text-gray-500">
              라이브박스에 등록된 콘텐츠 일정을 확인할 수 있습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-gray-500 hover:bg-gray-50"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-3 md:gap-4 md:grid-cols-[1fr_0.9fr]">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-2.5 md:p-3">
            <div className="mb-2 md:mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  setCurrentMonth(
                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1)
                  )
                }
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                aria-label="이전 달"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="text-xs md:text-sm font-semibold text-gray-900">{monthLabel}</span>
              <button
                type="button"
                onClick={() =>
                  setCurrentMonth(
                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)
                  )
                }
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                aria-label="다음 달"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1">
              {LIVE_BOX_SCHEDULE_WEEK_LABELS.map((label) => (
                <span
                  key={`week-${label}`}
                  className="flex h-7 md:h-8 items-center justify-center text-[11px] md:text-xs text-gray-500"
                >
                  {label}
                </span>
              ))}
              {monthCells.map((cell, index) => {
                if (!cell) {
                  return <span key={`empty-${index}`} className="h-8 md:h-9 w-full rounded-lg bg-transparent" />;
                }

                const dateKey = toDateKey(cell);
                const eventCount = dateCountMap.get(dateKey) || 0;
                const isSelected = isSameDate(cell, selectedDate);
                const isToday = isSameDate(cell, today);

                return (
                  <button
                    key={`day-${dateKey}`}
                    type="button"
                    onClick={() => setSelectedDate(parseDateKey(dateKey))}
                    className={`relative h-8 md:h-9 w-full cursor-pointer rounded-lg text-xs md:text-sm transition-colors ${isSelected
                        ? "bg-gray-900 text-white"
                        : "bg-white text-gray-700 hover:bg-gray-100"
                      } ${isToday && !isSelected ? "ring-1 ring-gray-300" : ""}`}
                  >
                    {cell.getDate()}
                    {eventCount > 0 ? (
                      <span
                        className={`absolute bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full ${isSelected ? "bg-white" : "bg-blue-500"
                          }`}
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-2.5 md:p-3">
            <p className="text-sm font-semibold text-gray-900">
              {selectedDateKey.replaceAll("-", ".")} 일정
            </p>
            <div className="mt-2 md:mt-3 max-h-none md:max-h-[360px] space-y-2 overflow-y-visible md:overflow-y-auto pr-1">
              {isLoading ? (
                <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-6 text-center text-xs text-gray-500">
                  일정을 불러오는 중입니다.
                </p>
              ) : selectedSchedules.length > 0 ? (
                selectedSchedules.map((schedule) => (
                  <Link
                    key={`live-box-schedule-${schedule.id}`}
                    href={`/live-box/${schedule.id}`}
                    onClick={onClose}
                    className="block rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 transition-colors hover:border-gray-300 hover:bg-white"
                  >
                    <p className="line-clamp-1 text-sm font-medium text-gray-900">{schedule.title}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {formatLiveBoxDisplayDate(schedule.startsAtRaw)} ~{" "}
                      {formatLiveBoxDisplayDate(schedule.endsAtRaw)}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-6 text-center text-xs text-gray-500">
                  선택한 날짜의 라이브박스 일정이 없습니다.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
