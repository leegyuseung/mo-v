"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useHeartLeaderboard } from "@/hooks/queries/heart/use-heart-leaderboard";
import { useIdolGroupCodeNames } from "@/hooks/queries/groups/use-idol-group-code-names";
import { useCrewCodeNames } from "@/hooks/queries/crews/use-crew-code-names";
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
  const [period, setPeriod] = useState<HeartRankPeriod>(periodFromQuery);
  const [keyword, setKeyword] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

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

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / RANK_PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const pagedRows = useMemo(() => {
    const start = (safePage - 1) * RANK_PAGE_SIZE;
    return filteredRows.slice(start, start + RANK_PAGE_SIZE);
  }, [filteredRows, safePage]);

  useEffect(() => {
    if (currentPage !== safePage) {
      setCurrentPage(safePage);
    }
  }, [currentPage, safePage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [period]);

  useEffect(() => {
    setPeriod(periodFromQuery);
  }, [periodFromQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [keyword]);

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6">
      <RankFilterBar
        period={period}
        keyword={keyword}
        filters={RANK_FILTERS}
        onChangePeriod={setPeriod}
        onChangeKeyword={setKeyword}
      />

      <RankListSection
        isLoading={isLoading}
        isError={isError}
        filteredCount={filteredRows.length}
        periodTitle={getPeriodTitle(period)}
        pagedRows={pagedRows}
        absoluteRankByStreamerId={absoluteRankByStreamerId}
        groupNameByCode={groupNameByCode}
        crewNameByCode={crewNameByCode}
        page={safePage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

