"use client";

import { useMemo, useState } from "react";
import { useAggregateRankPeriodKeys } from "@/hooks/queries/heart/use-aggregate-rank-period-keys";
import { useAggregateRankSnapshot } from "@/hooks/queries/heart/use-aggregate-rank-snapshot";
import AggregateRankRow from "@/components/screens/aggregate/aggregate-rank-row";
import {
  getMonthOptions,
  getWeekOptions,
  getYearOptions,
  isSelectionReady,
} from "@/components/screens/aggregate/aggregate-screen-utils";
import type { AggregatePeriodFilter, AggregateScreenClientProps } from "@/types/aggregate-rank";

const PERIOD_FILTERS: AggregatePeriodFilter[] = [
  { key: "yearly", label: "연간" },
  { key: "monthly", label: "월간" },
  { key: "weekly", label: "주간" },
];

export default function AggregateScreenClient({
  minAggregateYear,
  initialSelection,
  initialPeriodKeys,
  initialSnapshot,
}: AggregateScreenClientProps) {
  const [period, setPeriod] = useState(initialSelection.period);
  const [year, setYear] = useState(initialSelection.year);
  const [month, setMonth] = useState(initialSelection.month);
  const [weekOfMonth, setWeekOfMonth] = useState(initialSelection.weekOfMonth);

  const {
    data: periodKeys = [],
    isLoading: isPeriodKeysLoading,
    isError: isPeriodKeysError,
  } = useAggregateRankPeriodKeys(period, minAggregateYear, period === initialSelection.period ? initialPeriodKeys : undefined);

  const yearOptions = useMemo(() => getYearOptions(periodKeys), [periodKeys]);
  const selectedYear = yearOptions.includes(year) ? year : yearOptions[0];

  const monthOptions = useMemo(
    () => getMonthOptions(period, periodKeys, selectedYear),
    [period, periodKeys, selectedYear]
  );
  const selectedMonth = monthOptions.includes(month) ? month : monthOptions[0];

  const weekOptions = useMemo(
    () => getWeekOptions(period, periodKeys, selectedYear, selectedMonth),
    [period, periodKeys, selectedYear, selectedMonth]
  );
  const selectedWeekOfMonth = weekOptions.includes(weekOfMonth) ? weekOfMonth : weekOptions[0];

  const ready = useMemo(
    () =>
      isSelectionReady(
        period,
        yearOptions,
        selectedYear,
        monthOptions,
        selectedMonth,
        weekOptions,
        selectedWeekOfMonth
      ),
    [period, yearOptions, selectedYear, monthOptions, selectedMonth, weekOptions, selectedWeekOfMonth]
  );

  const { data, isLoading, isError } = useAggregateRankSnapshot(
    period,
    selectedYear || initialSelection.year,
    period === "yearly" ? 0 : selectedMonth || 1,
    period === "weekly" ? selectedWeekOfMonth || 1 : 0,
    ready,
    period === initialSelection.period ? initialSnapshot : undefined
  );

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6">
      <div className="mb-5 flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white p-1">
          {PERIOD_FILTERS.map((filter) => {
            const active = period === filter.key;
            return (
              <button
                key={filter.key}
                type="button"
                onClick={() => setPeriod(filter.key)}
                className={`cursor-pointer rounded-md px-3 py-1 text-sm font-medium transition-colors ${active ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {yearOptions.length > 0 ? (
            <select
              value={selectedYear}
              onChange={(event) => setYear(Number(event.target.value))}
              className="h-9 min-w-[96px] rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-700"
            >
              {yearOptions.map((optionYear) => (
                <option key={optionYear} value={optionYear}>
                  {optionYear}년
                </option>
              ))}
            </select>
          ) : null}

          {period !== "yearly" && monthOptions.length > 0 ? (
            <select
              value={selectedMonth}
              onChange={(event) => setMonth(Number(event.target.value))}
              className="h-9 min-w-[84px] rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-700"
            >
              {monthOptions.map((optionMonth) => (
                <option key={optionMonth} value={optionMonth}>
                  {optionMonth}월
                </option>
              ))}
            </select>
          ) : null}

          {period === "weekly" && weekOptions.length > 0 ? (
            <select
              value={selectedWeekOfMonth}
              onChange={(event) => setWeekOfMonth(Number(event.target.value))}
              className="h-9 min-w-[92px] rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-700"
            >
              {weekOptions.map((week) => (
                <option key={week} value={week}>
                  {week}주차
                </option>
              ))}
            </select>
          ) : null}
        </div>
      </div>

      {isPeriodKeysLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500">
          기간 옵션을 불러오는 중
        </div>
      ) : isPeriodKeysError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-8 text-center text-sm text-red-700">
          기간 옵션을 불러오지 못했습니다.
        </div>
      ) : !ready ? (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500">
          표시할 집계 기간 데이터가 없습니다.
        </div>
      ) : isLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500">
          집계 데이터를 불러오는 중
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-8 text-center text-sm text-red-700">
          집계 데이터를 불러오지 못했습니다.
        </div>
      ) : data && data.length > 0 ? (
        <div className="space-y-2">
          {data.map((row) => (
            <AggregateRankRow key={`${row.rank}-${row.streamer_id}`} row={row} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-500">
          해당 기간 집계가 없습니다.
        </div>
      )}
    </div>
  );
}
