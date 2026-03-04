"use client";

import type { HomeBroadcastFeedProps } from "@/types/home-broadcast-board";

const HOME_BROADCAST_EXPIRE_MINUTES = 6 * 60;

function getRemainingMinutesLabel(createdAt: string, nowMs: number) {
  const createdAtMs = new Date(createdAt).getTime();
  if (!Number.isFinite(createdAtMs)) return "-";

  const expiresAtMs = createdAtMs + HOME_BROADCAST_EXPIRE_MINUTES * 60 * 1000;
  const diffMs = expiresAtMs - nowMs;
  const minutes = Math.max(0, Math.ceil(diffMs / (60 * 1000)));
  return `${minutes}분`;
}

export default function HomeBroadcastFeed({
  isExpanded,
  isLoading,
  isError,
  nowMs,
  visibleLines,
  collapsedBroadcast,
}: HomeBroadcastFeedProps) {
  const collapsedText = isLoading
    ? "불러오는 중..."
    : isError
      ? "전광판을 불러오지 못했습니다."
      : collapsedBroadcast?.content || "진행중인 전광판 메시지가 없습니다.";

  return (
    <div className={`min-w-0 flex-1 overflow-hidden ${isExpanded ? "h-auto" : "h-9"}`}>
      {isExpanded ? (
        <div className="space-y-1 pr-1">
          {isLoading ? (
            <div className="min-w-0 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
              <p className="truncate text-sm text-gray-400">불러오는 중...</p>
            </div>
          ) : isError ? (
            <div className="min-w-0 rounded-lg border border-red-100 bg-red-50 px-3 py-2">
              <p className="truncate text-sm text-red-500">전광판을 불러오지 못했습니다.</p>
            </div>
          ) : visibleLines.length > 0 ? (
            visibleLines.map((item) => (
              <div
                key={`broadcast-${item.id}`}
                className="min-w-0 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <p className="min-w-0 flex-1 truncate text-sm text-gray-700">{item.content}</p>
                  <div className="inline-flex shrink-0 items-center gap-2 text-[11px] text-gray-500">
                    <span>{getRemainingMinutesLabel(item.created_at, nowMs)}</span>
                    <span className="text-gray-300">|</span>
                    <span>{item.author_nickname || "-"}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="min-w-0 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2">
              <p className="truncate text-sm text-gray-400">진행중인 전광판 메시지가 없습니다.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="min-w-0 flex-1 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 h-9">
          <div className="flex items-center gap-2">
            <p className={`min-w-0 flex-1 truncate text-sm ${isError ? "text-red-500" : "text-gray-700"}`}>
              {collapsedText}
            </p>
            {!isLoading && !isError && collapsedBroadcast ? (
              <div className="inline-flex shrink-0 items-center gap-2 text-[11px] text-gray-500">
                <span>{getRemainingMinutesLabel(collapsedBroadcast.created_at, nowMs)}</span>
                <span className="text-gray-300">|</span>
                <span>{collapsedBroadcast.author_nickname || "-"}</span>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

