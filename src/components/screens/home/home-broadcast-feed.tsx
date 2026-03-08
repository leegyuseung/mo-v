"use client";

import { Trash2 } from "lucide-react";
import IconTooltipButton from "@/components/common/icon-tooltip-button";
import UserProfileMenuTrigger from "@/components/common/user-profile-menu-trigger";
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
  canDeleteBroadcast,
  onDeleteBroadcast,
}: HomeBroadcastFeedProps) {
  const collapsedText = isLoading
    ? "불러오는 중..."
    : isError
      ? "전광판을 불러오지 못했습니다."
      : collapsedBroadcast?.content || "전광판에 표시할 메시지가 없습니다.";
  const fixedPlaceholderClass =
    "min-w-0 h-9 rounded-lg border px-3 py-2 flex items-center";

  return (
    <div className={`min-w-0 flex-1 ${isExpanded ? "h-auto" : "h-9"}`}>
      {isExpanded ? (
        <div className="space-y-1 pr-1">
          {isLoading ? (
            <div className={`${fixedPlaceholderClass} border-gray-100 bg-gray-50`}>
              <p className="truncate text-sm text-gray-400">불러오는 중...</p>
            </div>
          ) : isError ? (
            <div className={`${fixedPlaceholderClass} border-red-100 bg-red-50`}>
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
                    <UserProfileMenuTrigger
                      userPublicId={item.author_public_id}
                      label={item.author_nickname || "-"}
                      align="right"
                      className="max-w-24 cursor-pointer truncate text-gray-500 hover:text-gray-700"
                    />
                    {canDeleteBroadcast ? (
                      <>
                        <span className="text-gray-300">|</span>
                        <IconTooltipButton
                          icon={Trash2}
                          label="전광판 삭제"
                          tooltipAlign="right"
                          iconClassName="h-3.5 w-3.5 text-red-500"
                          buttonClassName="h-6 w-6 rounded-full text-red-500 hover:bg-red-50"
                          onClick={() => onDeleteBroadcast(item)}
                        />
                      </>
                    ) : null}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={`${fixedPlaceholderClass} border-gray-100 bg-gray-50`}>
              <p className="truncate text-sm text-gray-400">전광판에 표시할 메시지가 없습니다.</p>
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
                <UserProfileMenuTrigger
                  userPublicId={collapsedBroadcast.author_public_id}
                  label={collapsedBroadcast.author_nickname || "-"}
                  align="right"
                  className="max-w-20 cursor-pointer truncate text-gray-500 hover:text-gray-700"
                />
                {canDeleteBroadcast ? (
                  <>
                    <span className="text-gray-300">|</span>
                    <IconTooltipButton
                      icon={Trash2}
                      label="전광판 삭제"
                      tooltipAlign="right"
                      iconClassName="h-3.5 w-3.5 text-red-500"
                      buttonClassName="h-6 w-6 rounded-full text-red-500 hover:bg-red-50"
                      onClick={() => onDeleteBroadcast(collapsedBroadcast)}
                    />
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
