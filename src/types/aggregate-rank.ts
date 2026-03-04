export type AggregatePeriod = "weekly" | "monthly" | "yearly";

export type AggregateRankPeriodKey = {
  year: number;
  month: number;
  week_of_month: number;
};

export type AggregateRankSnapshotRow = {
  rank: number;
  streamer_id: number;
  streamer_nickname: string | null;
  streamer_public_id: string | null;
  streamer_image_url: string | null;
  total_received: number;
  gift_count: number;
  donor_count: number;
  top_donor_user_id: string | null;
  top_donor_public_id?: string | null;
  top_donor_avatar_url?: string | null;
  top_donor_nickname: string | null;
  top_donor_total: number;
  period_start_at: string;
  period_end_at: string;
  generated_at: string;
};

export type AggregatePeriodFilter = {
  key: AggregatePeriod;
  label: string;
};

export type AggregateSelection = {
  period: AggregatePeriod;
  year: number;
  month: number;
  weekOfMonth: number;
};

export type AggregateScreenClientProps = {
  minAggregateYear: number;
  initialSelection: AggregateSelection;
  initialPeriodKeys: AggregateRankPeriodKey[];
  initialSnapshot: AggregateRankSnapshotRow[];
};

export type AggregateRankRowProps = {
  row: AggregateRankSnapshotRow;
};
