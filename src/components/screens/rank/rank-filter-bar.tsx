import SearchInput from "@/components/common/search-input";
import type { RankFilterBarProps } from "@/types/rank-screen";

export default function RankFilterBar({
  period,
  keyword,
  filters,
  onChangePeriod,
  onChangeKeyword,
}: RankFilterBarProps) {
  return (
    <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white p-1">
        {filters.map((filter) => {
          const isActive = period === filter.key;
          return (
            <button
              key={filter.key}
              type="button"
              onClick={() => onChangePeriod(filter.key)}
              className={`cursor-pointer rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                isActive ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
      <SearchInput
        value={keyword}
        onChange={onChangeKeyword}
        placeholder="이름, 그룹, 크루 검색"
        containerClassName="w-full md:w-64"
        inputClassName="h-9 border-gray-200 bg-white"
      />
    </div>
  );
}

