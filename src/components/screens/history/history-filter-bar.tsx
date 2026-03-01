import type { HistoryFilter } from "@/types/history-screen";
import type { HistoryFilterBarProps } from "@/types/history-screen";
import {
  getHistoryTypeLabel,
  HISTORY_FILTER_OPTIONS,
} from "@/components/screens/history/history-screen-utils";

export default function HistoryFilterBar({
  filter,
  typeFilter,
  typeOptions,
  startDateFilter,
  endDateFilter,
  onChangeFilter,
  onChangeTypeFilter,
  onChangeStartDateFilter,
  onChangeEndDateFilter,
  onResetDateFilter,
}: HistoryFilterBarProps) {
  return (
    <div className="mb-3 space-y-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white p-1">
          {HISTORY_FILTER_OPTIONS.map((option) => {
            const isActive = filter === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChangeFilter(option.value as HistoryFilter)}
                className={`cursor-pointer rounded-md px-3 py-1 text-xs font-semibold transition-colors ${
                  isActive ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
        <select
          value={typeFilter}
          onChange={(event) => onChangeTypeFilter(event.target.value)}
          className="h-8 min-w-[140px] rounded-lg border border-gray-200 bg-white px-2 text-xs font-medium text-gray-700 outline-none focus:border-gray-400"
        >
          <option value="all">유형 전체</option>
          {typeOptions.map((type) => (
            <option key={type} value={type}>
              {getHistoryTypeLabel(type)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-sm font-semibold text-gray-500">포인트 내역</h2>
        <div className="ml-auto flex items-center gap-1">
          <input
            type="date"
            value={startDateFilter}
            onChange={(event) => onChangeStartDateFilter(event.target.value)}
            className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs font-medium text-gray-700 outline-none focus:border-gray-400"
          />
          <span className="text-xs text-gray-400">~</span>
          <input
            type="date"
            value={endDateFilter}
            onChange={(event) => onChangeEndDateFilter(event.target.value)}
            className="h-8 rounded-lg border border-gray-200 bg-white px-2 text-xs font-medium text-gray-700 outline-none focus:border-gray-400"
          />
        </div>
        <button
          type="button"
          onClick={onResetDateFilter}
          className="cursor-pointer rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100"
        >
          초기화
        </button>
      </div>
    </div>
  );
}
