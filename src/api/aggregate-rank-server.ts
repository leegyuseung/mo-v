import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type {
  AggregatePeriod,
  AggregateRankPeriodKey,
  AggregateRankSnapshotRow,
} from "@/types/aggregate-rank";
import { enrichAggregateRankRows } from "@/api/aggregate-rank-enrichment";

async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

export async function fetchAggregateRankSnapshotOnServer(
  period: AggregatePeriod,
  year: number,
  month: number,
  weekOfMonth: number
): Promise<AggregateRankSnapshotRow[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.rpc("get_streamer_heart_rank_snapshot", {
    p_period_type: period,
    p_year: year,
    p_month: month,
    p_week_of_month: weekOfMonth,
  });
  if (error) throw error;

  const rows = (data || []) as AggregateRankSnapshotRow[];
  return enrichAggregateRankRows(supabase, rows);
}

export async function fetchAggregateRankPeriodKeysOnServer(
  period: AggregatePeriod,
  minYear: number = 2026
) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("streamer_heart_rank_snapshots")
    .select("year,month,week_of_month")
    .eq("period_type", period)
    .eq("rank", 1)
    .gte("year", minYear)
    .order("year", { ascending: false })
    .order("month", { ascending: false })
    .order("week_of_month", { ascending: false });

  if (error) throw error;
  return (data || []) as AggregateRankPeriodKey[];
}
