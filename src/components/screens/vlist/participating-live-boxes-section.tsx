"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CalendarClock } from "lucide-react";
import LiveBoxStatusBadge from "@/components/common/live-box-status-badge";
import { useParticipatingLiveBoxes } from "@/hooks/queries/live-box/use-participating-live-boxes";
import { cn } from "@/lib/utils";
import type { ParticipatingLiveBoxesSectionProps } from "@/types/vlist-participating-live-boxes";
import { formatLiveBoxDisplayDate } from "@/utils/live-box-presenter";

function toComparableStartTime(value: string | null) {
  if (!value) return Number.MAX_SAFE_INTEGER;
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return Number.MAX_SAFE_INTEGER;
  return timestamp;
}

/** 스트리머가 참여 중(대기/진행중)인 라이브박스를 시작일시 순으로 보여준다. */
export default function ParticipatingLiveBoxesSection({
  streamerChzzkId,
  streamerSoopId,
  className,
}: ParticipatingLiveBoxesSectionProps) {
  const platformIds = useMemo(
    () =>
      [streamerChzzkId, streamerSoopId]
        .filter((value): value is string => Boolean(value))
        .map((value) => value.trim().toLowerCase()),
    [streamerChzzkId, streamerSoopId]
  );
  const platformIdSet = new Set(platformIds);

  const {
    data: participatingLiveBoxes = [],
    isLoading,
    isError,
  } = useParticipatingLiveBoxes(platformIds);

  const sortedParticipatingLiveBoxes = [...participatingLiveBoxes].sort(
    (left, right) =>
      toComparableStartTime(left.starts_at) -
      toComparableStartTime(right.starts_at)
  );

  return (
    <div
      className={cn(
        "mt-4 w-full md:w-1/2 h-[246px] rounded-xl border border-gray-200 bg-white p-3 flex flex-col",
        className
      )}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-gray-700">참여 라이브박스</p>
        <span className="text-xs text-gray-500">
          {sortedParticipatingLiveBoxes.length.toLocaleString()}개
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={`participating-live-box-skeleton-${index}`}
                className="h-14 animate-pulse rounded-md bg-gray-200/70"
              />
            ))}
          </div>
        ) : isError ? (
          <p className="text-sm text-red-500">참여 라이브박스를 불러오지 못했습니다.</p>
        ) : platformIdSet.size === 0 ? (
          <p className="text-sm text-gray-500">플랫폼 ID가 없어 참여 박스를 확인할 수 없습니다.</p>
        ) : sortedParticipatingLiveBoxes.length === 0 ? (
          <p className="text-sm text-gray-500">참여 중인 라이브박스가 없습니다.</p>
        ) : (
          <div className="space-y-2">
            {sortedParticipatingLiveBoxes.map((box) => (
              <Link
                key={`participating-live-box-${box.id}`}
                href={`/live-box/${box.id}`}
                className="block rounded-xl border border-gray-200 bg-white px-3 py-2 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-1 text-sm font-medium text-gray-900">{box.title}</p>
                  <LiveBoxStatusBadge status={box.status} className="px-2 py-0.5" />
                </div>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-600">
                  <CalendarClock className="h-3.5 w-3.5 text-gray-400" />
                  <span>시작일시 {formatLiveBoxDisplayDate(box.starts_at)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
