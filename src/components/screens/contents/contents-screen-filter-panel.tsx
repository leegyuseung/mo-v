"use client";

import { useEffect, useRef, useState } from "react";
import SearchInput from "@/components/common/search-input";
import { CONTENT_TYPE_OPTIONS, CONTENT_TYPE_OPTIONS2 } from "@/types/content";
import type {
  BadgeFilter,
  ContentSortKey,
  ContentStatusFilter,
} from "@/types/contents-screen";
import type { ContentsScreenFilterPanelProps } from "@/types/contents-screen-components";

function getButtonClassName(isSelected: boolean) {
  return `h-8 cursor-pointer rounded-md border px-3 text-xs font-medium transition-colors ${isSelected
      ? "border-gray-900 bg-gray-900 text-white"
      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
    }`;
}

const BADGE_FILTER_OPTIONS: Array<{ value: BadgeFilter; label: string }> = [
  { value: "all", label: "전체" },
  { value: "new", label: "NEW" },
  { value: "closing", label: "마감임박" },
];

const STATUS_FILTER_OPTIONS: Array<{ value: ContentStatusFilter; label: string }> = [
  { value: "all", label: "전체" },
  { value: "approved", label: "모집" },
  { value: "pending", label: "대기" },
  { value: "ended", label: "마감" },
];

const SORT_OPTIONS: Array<{ value: ContentSortKey; label: string }> = [
  { value: "created", label: "등록순" },
  { value: "view", label: "조회순" },
  { value: "heart", label: "하트순" },
  { value: "deadline", label: "마감순" },
];

const CONTENT_TYPE_DROPDOWN_OPTIONS = [...CONTENT_TYPE_OPTIONS, ...CONTENT_TYPE_OPTIONS2] as string[];

export default function ContentsScreenFilterPanel({
  searchKeyword,
  onChangeSearchKeyword,
  canCreateContent,
  onClickCreateContent,
  badgeFilter,
  onChangeBadgeFilter,
  selectedContentTypes,
  onResetContentTypeFilter,
  onToggleContentType,
  sortKey,
  onClickSortButton,
  statusFilter,
  onChangeStatusFilter,
  totalCount,
}: ContentsScreenFilterPanelProps) {
  const [isContentTypeDropdownOpen, setIsContentTypeDropdownOpen] = useState(false);
  const contentTypeDropdownRef = useRef<HTMLDivElement | null>(null);
  const selectedContentTypeCount = selectedContentTypes.length;
  const contentTypeTriggerLabel =
    selectedContentTypeCount === 0 ? "전체" : `선택 (${selectedContentTypeCount})`;

  useEffect(() => {
    if (!isContentTypeDropdownOpen) return;
    const onClickOutside = (event: MouseEvent) => {
      if (!contentTypeDropdownRef.current) return;
      const target = event.target as Node;
      if (contentTypeDropdownRef.current.contains(target)) return;
      setIsContentTypeDropdownOpen(false);
    };

    window.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("mousedown", onClickOutside);
    };
  }, [isContentTypeDropdownOpen]);

  return (
    <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <SearchInput
          value={searchKeyword}
          onChange={onChangeSearchKeyword}
          placeholder="제목, 콘텐츠 설명 검색"
          containerClassName="w-full md:max-w-md"
        />
        <button
          type="button"
          onClick={onClickCreateContent}
          disabled={!canCreateContent}
          className="cursor-pointer rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50 md:shrink-0"
        >
          콘텐츠 추가
        </button>
      </div>

      <div className="mt-2 flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">구분</span>
          <select
            value={badgeFilter}
            onChange={(event) => onChangeBadgeFilter(event.target.value as BadgeFilter)}
            className="h-8 shrink-0 cursor-pointer rounded-md border border-gray-200 bg-white px-3 text-xs text-gray-700 outline-none focus:border-gray-300"
          >
            {BADGE_FILTER_OPTIONS.map((option) => (
              <option key={`contents-badge-${option.value}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <span className="ml-1 text-sm text-gray-500">상태</span>
          <select
            value={statusFilter}
            onChange={(event) => onChangeStatusFilter(event.target.value as ContentStatusFilter)}
            className="h-8 shrink-0 cursor-pointer rounded-md border border-gray-200 bg-white px-3 text-xs text-gray-700 outline-none focus:border-gray-300"
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <option key={`contents-status-${option.value}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">종류</span>
          <div className="relative" ref={contentTypeDropdownRef}>
            <button
              type="button"
              onClick={() => setIsContentTypeDropdownOpen((prev) => !prev)}
              className="inline-flex h-8 min-w-[118px] cursor-pointer items-center justify-between rounded-md border border-gray-200 bg-white px-3 text-xs text-gray-700 outline-none transition-colors hover:bg-gray-50 focus:border-gray-300"
            >
              <span>{contentTypeTriggerLabel}</span>
              <span className="ml-2 text-[10px] text-gray-500">▼</span>
            </button>

            {isContentTypeDropdownOpen ? (
              <div className="absolute left-0 z-20 mt-2 w-52 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                <div className="mb-2 flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="text-xs font-medium text-gray-700">다중 선택</span>
                  <button
                    type="button"
                    onClick={onResetContentTypeFilter}
                    className="cursor-pointer text-xs text-gray-500 hover:text-gray-700"
                  >
                    초기화
                  </button>
                </div>

                <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
                  {CONTENT_TYPE_DROPDOWN_OPTIONS.map((type) => (
                    <label
                      key={`content-type-dropdown-${type}`}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedContentTypes.includes(type)}
                        onChange={() => onToggleContentType(type)}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-gray-800 focus:ring-gray-300"
                      />
                      <span className="text-xs text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 md:flex-nowrap md:overflow-x-auto">
          <span className="text-sm text-gray-500">정렬</span>
          {SORT_OPTIONS.map((option) => (
            <button
              key={`contents-sort-${option.value}`}
              type="button"
              onClick={() => onClickSortButton(option.value)}
              className={`${getButtonClassName(sortKey === option.value)} shrink-0`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-2 text-xs text-gray-500">총 {totalCount.toLocaleString()}개 결과</p>
    </div>
  );
}
