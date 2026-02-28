"use client";

import SearchInput from "@/components/common/search-input";
import { CONTENT_TYPE_OPTIONS, CONTENT_TYPE_OPTIONS2 } from "@/types/content";
import type {
  ContentStatusFilter,
  ParticipantCompositionFilter,
} from "@/types/contents-screen";
import type { ContentsScreenFilterPanelProps } from "@/types/contents-screen-components";

function getButtonClassName(isSelected: boolean) {
  return `h-8 cursor-pointer rounded-md border px-3 text-xs font-medium transition-colors ${
    isSelected
      ? "border-gray-900 bg-gray-900 text-white"
      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
  }`;
}

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
  participantCompositionFilter,
  onChangeParticipantCompositionFilter,
  statusFilter,
  onChangeStatusFilter,
  totalCount,
}: ContentsScreenFilterPanelProps) {
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

      <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => onChangeBadgeFilter("all")} className={getButtonClassName(badgeFilter === "all")}>전체</button>
          <button type="button" onClick={() => onChangeBadgeFilter("new")} className={getButtonClassName(badgeFilter === "new")}>NEW</button>
          <button type="button" onClick={() => onChangeBadgeFilter("closing")} className={getButtonClassName(badgeFilter === "closing")}>마감임박</button>
        </div>
        <div className="hidden flex-wrap gap-1.5 md:flex md:justify-end">
          <button
            type="button"
            onClick={onResetContentTypeFilter}
            className={getButtonClassName(selectedContentTypes.length === 0)}
          >
            전체
          </button>
          {CONTENT_TYPE_OPTIONS.map((type) => (
            <button
              key={`content-type-filter-${type}`}
              type="button"
              onClick={() => onToggleContentType(type)}
              className={getButtonClassName(selectedContentTypes.includes(type))}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2 md:flex-nowrap md:items-center md:gap-1.5 md:overflow-x-auto">
          <button type="button" onClick={() => onClickSortButton("created")} className={`${getButtonClassName(sortKey === "created")} shrink-0`}>등록순</button>
          <button type="button" onClick={() => onClickSortButton("view")} className={`${getButtonClassName(sortKey === "view")} shrink-0`}>조회순</button>
          <button type="button" onClick={() => onClickSortButton("heart")} className={`${getButtonClassName(sortKey === "heart")} shrink-0`}>하트순</button>
          <button type="button" onClick={() => onClickSortButton("title")} className={`${getButtonClassName(sortKey === "title")} shrink-0`}>제목순</button>
          <button type="button" onClick={() => onClickSortButton("deadline")} className={`${getButtonClassName(sortKey === "deadline")} shrink-0`}>일정마감순</button>

          <select
            value={participantCompositionFilter}
            onChange={(event) =>
              onChangeParticipantCompositionFilter(
                event.target.value as ParticipantCompositionFilter
              )
            }
            className="h-8 shrink-0 cursor-pointer rounded-md border border-gray-200 bg-white px-3 text-xs text-gray-700 outline-none focus:border-gray-300"
          >
            <option value="all">전체</option>
            <option value="버츄얼만">버츄얼만</option>
            <option value="버츄얼포함">버츄얼포함</option>
          </select>
          <select
            value={statusFilter}
            onChange={(event) => onChangeStatusFilter(event.target.value as ContentStatusFilter)}
            className="h-8 shrink-0 cursor-pointer rounded-md border border-gray-200 bg-white px-3 text-xs text-gray-700 outline-none focus:border-gray-300"
          >
            <option value="all">전체</option>
            <option value="approved">모집중</option>
            <option value="pending">대기중</option>
            <option value="ended">마감</option>
          </select>
        </div>

        <div className="hidden md:ml-auto md:block md:min-w-0 md:flex-1">
          <div className="flex flex-wrap gap-1.5 md:justify-end">
            {CONTENT_TYPE_OPTIONS2.map((type) => (
              <button
                key={`content-type-filter-${type}`}
                type="button"
                onClick={() => onToggleContentType(type)}
                className={getButtonClassName(selectedContentTypes.includes(type))}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-2 text-xs text-gray-500">총 {totalCount.toLocaleString()}개 결과</p>
    </div>
  );
}
