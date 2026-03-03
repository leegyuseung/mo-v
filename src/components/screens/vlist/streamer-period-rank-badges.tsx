"use client";

import { useMemo } from "react";
import { useStreamerHeartPeriodRanks } from "@/hooks/queries/heart/use-streamer-heart-period-ranks";
import type { HeartPeriodRank } from "@/types/heart-period-rank";

type StreamerPeriodRankBadgesProps = {
  streamerId: number;
};

const PERIOD_BADGE_CLASSNAME: Record<HeartPeriodRank["period"], string> = {
  all: "border-rose-200 bg-rose-50 text-rose-700",
  yearly: "border-amber-200 bg-amber-50 text-amber-700",
  monthly: "border-blue-200 bg-blue-50 text-blue-700",
  weekly: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

/** 스트리머의 기간별 랭킹(전체/연간/월간/주간)을 상단 배지로 노출한다. 값이 없으면 숨긴다. */
export default function StreamerPeriodRankBadges({ streamerId }: StreamerPeriodRankBadgesProps) {
  const { data: periodRanks = [] } = useStreamerHeartPeriodRanks(streamerId);

  const rankItems = useMemo(() => {
    return periodRanks
      .filter((item) => item.rank !== null)
      .map((item) => ({
        ...item,
        className: PERIOD_BADGE_CLASSNAME[item.period],
      }));
  }, [periodRanks]);

  if (rankItems.length === 0) return null;

  return (
    <div className="mr-1 hidden md:flex items-center gap-1">
      {rankItems.map((item) => (
        <span
          key={`streamer-period-rank-${item.period}`}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold ${item.className}`}
        >
          <span>{item.label}</span>
          <span>{item.rank}위</span>
        </span>
      ))}
    </div>
  );
}
