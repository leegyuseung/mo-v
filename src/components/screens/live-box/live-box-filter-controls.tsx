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
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onSelectStatusFilter("all")}
            className={`cursor-pointer ${
              statusFilter === "all"
                ? "border-gray-900 bg-gray-900 text-white hover:bg-gray-800 hover:text-white"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-700"
            }`}
          >
            전체
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onSelectStatusFilter("ongoing")}
            className={`cursor-pointer ${
              statusFilter === "ongoing"
                ? "border-gray-900 bg-gray-900 text-white hover:bg-gray-800 hover:text-white"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-700"
            }`}
          >
            진행중
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onSelectStatusFilter("pending")}
            className={`cursor-pointer ${
              statusFilter === "pending"
                ? "border-gray-900 bg-gray-900 text-white hover:bg-gray-800 hover:text-white"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-700"
            }`}
          >
            대기
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => onSelectStatusFilter("closed")}
            className={`cursor-pointer ${
              statusFilter === "closed"
                ? "border-gray-900 bg-gray-900 text-white hover:bg-gray-800 hover:text-white"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-700"
            }`}
          >
            종료
          </Button>
        </div>

        <div className="flex w-full items-center gap-2 md:w-auto">
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
          {hasUser ? <LiveBoxRequestTriggerButton label="추가요청" className="h-8 shrink-0" /> : null}
        </div>
      </div>

      <p className="mt-2 text-xs text-gray-500">총 {totalCount.toLocaleString()}개 결과</p>
    </div>
  );
}
