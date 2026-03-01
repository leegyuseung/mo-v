import { ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import type { HistoryListProps } from "@/types/history-screen";
import { formatHistoryDate, getHistoryTypeLabel } from "@/components/screens/history/history-screen-utils";
import type { HeartPointHistory } from "@/types/profile";

export default function HistoryList({
  isLoading,
  filteredCount,
  pagedHistory,
}: HistoryListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, index) => (
          <div
            key={`history-skeleton-${index}`}
            className="h-16 rounded-xl bg-gray-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (filteredCount === 0) {
    return (
      <div className="py-12 text-center text-sm text-gray-400">
        포인트 내역이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {pagedHistory.map((item: HeartPointHistory) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 transition-colors hover:border-gray-200"
        >
          <div className="flex items-center gap-3">
            {item.amount >= 0 ? (
              <ArrowUpCircle className="h-5 w-5 shrink-0 text-blue-500" />
            ) : (
              <ArrowDownCircle className="h-5 w-5 shrink-0 text-red-500" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">
                {item.description || getHistoryTypeLabel(item.type) || item.type || "기타"}
              </p>
              <p className="text-xs text-gray-400">{formatHistoryDate(item.created_at)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-sm font-bold ${item.amount >= 0 ? "text-blue-600" : "text-red-500"}`}>
              {item.amount >= 0 ? "+" : ""}
              {item.amount.toLocaleString()} 하트
            </p>
            <p className="text-xs text-gray-400">잔액 {item.after_point.toLocaleString()} 하트</p>
          </div>
        </div>
      ))}
    </div>
  );
}
