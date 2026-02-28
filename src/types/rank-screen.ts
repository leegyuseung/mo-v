import type { HeartRankPeriod, StreamerHeartLeaderboardItem } from "@/types/heart";

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
  pagedRows: StreamerHeartLeaderboardItem[];
  absoluteRankByStreamerId: Map<number, number>;
  groupNameByCode: Map<string, string>;
  crewNameByCode: Map<string, string>;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

