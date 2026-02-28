import type { HeartRankPeriod, StreamerHeartLeaderboardItem } from "@/types/heart";
import type { RefObject } from "react";

export type RankFilterOption = {
  key: HeartRankPeriod;
  label: string;
};

export type RankFilterBarProps = {
  period: HeartRankPeriod;
  keyword: string;
  filters: RankFilterOption[];
  onChangePeriod: (period: HeartRankPeriod) => void;
  onChangeKeyword: (keyword: string) => void;
};

export type RankRowProps = {
  item: StreamerHeartLeaderboardItem;
  rankNumber: number;
  groupNameByCode: Map<string, string>;
  crewNameByCode: Map<string, string>;
};

export type RankListSectionProps = {
  isLoading: boolean;
  isError: boolean;
  filteredCount: number;
  periodTitle: string;
  visibleRows: StreamerHeartLeaderboardItem[];
  absoluteRankByStreamerId: Map<number, number>;
  groupNameByCode: Map<string, string>;
  crewNameByCode: Map<string, string>;
  hasMore: boolean;
  sentinelRef: RefObject<HTMLDivElement | null>;
};
