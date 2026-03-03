export type HeartPeriodRank = {
  period: "all" | "yearly" | "monthly" | "weekly";
  label: "전체" | "연간" | "월간" | "주간";
  rank: number | null;
};

export type StreamerPeriodRanks = HeartPeriodRank[];
