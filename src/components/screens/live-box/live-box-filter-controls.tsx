import LiveBoxRequestTriggerButton from "@/components/screens/live-box/live-box-request-trigger-button";
import { Button } from "@/components/ui/button";
import SearchInput from "@/components/common/search-input";
import type { LiveBoxFilterControlsProps } from "@/types/live-box-screen";

export default function LiveBoxFilterControls({
  keyword,
  totalCount,
  statusFilter,
  sortKey,
  hasUser,
  onKeywordChange,
  onSelectStatusFilter,
  onClickSortButton,
}: LiveBoxFilterControlsProps) {
  return (
    <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4">
      <SearchInput
        value={keyword}
        onChange={onKeywordChange}
        placeholder="제목, 카테고리, 참가자(닉네임/플랫폼 ID) 검색"
      />

      <div className="mt-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2 md:flex-row md:flex-wrap md:items-center">
          <div className="flex w-full items-center justify-between gap-2 md:w-auto md:justify-start">
            <div className="flex items-center gap-2">
              <span className="self-center text-sm text-gray-500">상태</span>
              <select
                value={statusFilter}
                onChange={(event) =>
                  onSelectStatusFilter(
                    event.target.value as "all" | "ongoing" | "pending" | "closed"
                  )
                }
                className="h-8 w-24 shrink-0 cursor-pointer rounded-md border border-gray-200 bg-white px-2 text-xs text-gray-700 outline-none focus:border-gray-300"
              >
                <option value="all">전체</option>
                <option value="ongoing">진행중</option>
                <option value="pending">대기</option>
                <option value="closed">종료</option>
              </select>
            </div>
            {hasUser ? (
              <LiveBoxRequestTriggerButton label="추가요청" className="h-8 shrink-0 md:hidden" />
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2 md:flex-nowrap">
            <span className="self-center text-sm text-gray-500">정렬</span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onClickSortButton("created")}
              className={`cursor-pointer ${
                sortKey === "created"
                  ? "border-gray-900 bg-gray-900 text-white hover:bg-gray-800 hover:text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              등록순
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onClickSortButton("title")}
              className={`cursor-pointer ${
                sortKey === "title"
                  ? "border-gray-900 bg-gray-900 text-white hover:bg-gray-800 hover:text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              제목순
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onClickSortButton("participants")}
              className={`cursor-pointer ${
                sortKey === "participants"
                  ? "border-gray-900 bg-gray-900 text-white hover:bg-gray-800 hover:text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-700"
              }`}
            >
              참여자순
            </Button>
          </div>
        </div>

        {hasUser ? (
          <div className="hidden w-full items-center gap-2 md:flex md:w-auto md:justify-end">
            <LiveBoxRequestTriggerButton label="추가요청" className="h-8 shrink-0" />
          </div>
        ) : null}
      </div>

      <p className="mt-2 text-xs text-gray-500">총 {totalCount.toLocaleString()}개 결과</p>
    </div>
  );
}
