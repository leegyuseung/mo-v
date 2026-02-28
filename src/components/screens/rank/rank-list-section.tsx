import Pagination from "@/components/common/pagination";
import RankRow from "@/components/screens/rank/rank-row";
import type { RankListSectionProps } from "@/types/rank-screen";

export default function RankListSection({
  isLoading,
  isError,
  filteredCount,
  periodTitle,
  pagedRows,
  absoluteRankByStreamerId,
  groupNameByCode,
  crewNameByCode,
  page,
  totalPages,
  onPageChange,
}: RankListSectionProps) {
  return (
    <>
      <div className="mb-3 text-sm text-gray-500">
        {periodTitle} 기준 {filteredCount.toLocaleString()}명
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 10 }).map((_, index) => (
            <div
              key={`rank-skeleton-${index}`}
              className="h-[72px] animate-pulse rounded-xl border border-gray-100 bg-gray-50"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-400">
          랭킹 데이터를 불러오지 못했습니다.
        </div>
      ) : filteredCount === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-10 text-center text-sm text-gray-400">
          표시할 랭킹이 없습니다.
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {pagedRows.map((item) => {
              const rankNumber = absoluteRankByStreamerId.get(item.streamer_id) ?? 0;
              return (
                <RankRow
                  key={`${item.streamer_id}`}
                  item={item}
                  rankNumber={rankNumber}
                  groupNameByCode={groupNameByCode}
                  crewNameByCode={crewNameByCode}
                />
              );
            })}
          </div>
          <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
        </>
      )}
    </>
  );
}

