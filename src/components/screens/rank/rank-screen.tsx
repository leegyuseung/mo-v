"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useHeartLeaderboard } from "@/hooks/queries/heart/use-heart-leaderboard";
import { useIdolGroupCodeNames } from "@/hooks/queries/groups/use-idol-group-code-names";
import { useCrewCodeNames } from "@/hooks/queries/crews/use-crew-code-names";
import { useInfiniteScrollTrigger } from "@/hooks/use-infinite-scroll-trigger";
import RankFilterBar from "@/components/screens/rank/rank-filter-bar";
import RankListSection from "@/components/screens/rank/rank-list-section";
import {
  getPeriodTitle,
  isMatchedRankKeyword,
  RANK_FETCH_LIMIT,
  RANK_FILTERS,
  RANK_PAGE_SIZE,
  toHeartRankPeriod,
} from "@/components/screens/rank/rank-screen-utils";
import type { HeartRankPeriod } from "@/types/heart";

export default function RankScreen() {
  const searchParams = useSearchParams();
  const periodFromQuery = toHeartRankPeriod(searchParams.get("period"));
  const [period, setPeriod] = useState<HeartRankPeriod>(() => periodFromQuery);
  const [keyword, setKeyword] = useState("");
  const [visibleCount, setVisibleCount] = useState(RANK_PAGE_SIZE);

  const { data, isLoading, isError } = useHeartLeaderboard(period, RANK_FETCH_LIMIT);
  const { data: idolGroups } = useIdolGroupCodeNames();
  const { data: crews } = useCrewCodeNames();

  const groupNameByCode = useMemo(() => {
    const map = new Map<string, string>();
    (idolGroups || []).forEach((group) => {
      map.set(group.group_code.trim().toLowerCase(), group.name);
    });
    return map;
  }, [idolGroups]);

  const crewNameByCode = useMemo(() => {
    const map = new Map<string, string>();
    (crews || []).forEach((crew) => {
      map.set(crew.crew_code.trim().toLowerCase(), crew.name);
    });
    return map;
  }, [crews]);

  const rankRows = useMemo(() => {
    return (data || []).filter((item) => (item.total_received || 0) > 0);
  }, [data]);

  const absoluteRankByStreamerId = useMemo(() => {
    const map = new Map<number, number>();
    rankRows.forEach((item, index) => {
      map.set(item.streamer_id, index + 1);
    });
    return map;
  }, [rankRows]);

  const filteredRows = useMemo(() => {
    return rankRows.filter((item) =>
      isMatchedRankKeyword(item, keyword, groupNameByCode, crewNameByCode)
    );
  }, [rankRows, keyword, groupNameByCode, crewNameByCode]);

  const visibleRows = useMemo(() => {
    return filteredRows.slice(0, visibleCount);
  }, [filteredRows, visibleCount]);
  const hasMore = visibleRows.length < filteredRows.length;

  const onLoadMore = () => {
    if (!hasMore) return;
    setVisibleCount((prev) => Math.min(prev + RANK_PAGE_SIZE, filteredRows.length));
  };
  const sentinelRef = useInfiniteScrollTrigger({
    hasMore,
    isLoading,
    onLoadMore,
  });

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6">
      <RankFilterBar
        period={period}
        keyword={keyword}
        filters={RANK_FILTERS}
        onChangePeriod={(nextPeriod) => {
          setPeriod(nextPeriod);
          setVisibleCount(RANK_PAGE_SIZE);
        }}
        onChangeKeyword={(nextKeyword) => {
          setKeyword(nextKeyword);
          setVisibleCount(RANK_PAGE_SIZE);
        }}
      />

      <RankListSection
        isLoading={isLoading}
        isError={isError}
        filteredCount={filteredRows.length}
        periodTitle={getPeriodTitle(period)}
        visibleRows={visibleRows}
        absoluteRankByStreamerId={absoluteRankByStreamerId}
        groupNameByCode={groupNameByCode}
        crewNameByCode={crewNameByCode}
        hasMore={hasMore}
        sentinelRef={sentinelRef}
      />
    </div>
  );
}
