"use client";

import SearchInput from "@/components/common/search-input";
import type {
  AdminHomeBroadcastFiltersProps,
} from "@/types/admin-home-broadcast-screen";
import type { AdminHomeBroadcastStatusFilter } from "@/types/admin-home-broadcast";

const STATUS_OPTIONS: Array<{ label: string; value: AdminHomeBroadcastStatusFilter }> = [
  { label: "전체", value: "all" },
  { label: "진행중", value: "active" },
  { label: "종료", value: "ended" },
  { label: "삭제됨", value: "deleted" },
];

export default function HomeBroadcastsFilters({
  searchKeyword,
  statusFilter,
  onSearchKeywordChange,
  onStatusFilterChange,
}: AdminHomeBroadcastFiltersProps) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center">
      <SearchInput
        value={searchKeyword}
        onChange={onSearchKeywordChange}
        placeholder="내용, 작성자, 삭제 사유 검색"
        containerClassName="w-full md:w-80"
        inputClassName="h-9"
      />
      <div className="inline-flex items-center gap-2">
        <span className="text-xs font-semibold text-gray-500">상태</span>
        <select
          value={statusFilter}
          onChange={(event) =>
            onStatusFilterChange(event.target.value as AdminHomeBroadcastStatusFilter)
          }
          className="h-9 min-w-[120px] rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-700"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
