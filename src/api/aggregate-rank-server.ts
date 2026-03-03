import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type {
  AggregatePeriod,
  AggregateRankPeriodKey,
  AggregateRankSnapshotRow,
} from "@/types/aggregate-rank";

async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createClient(cookieStore);
}

export async function fetchAggregateRankSnapshotOnServer(
  period: AggregatePeriod,
  year: number,
  month: number,
  weekOfMonth: number
) {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase.rpc("get_streamer_heart_rank_snapshot", {
    p_period_type: period,
    p_year: year,
    p_month: month,
    p_week_of_month: weekOfMonth,
  });
  if (error) throw error;

  const rows = (data || []) as AggregateRankSnapshotRow[];
  const streamerIds = Array.from(
    new Set(
      rows
        .map((row) => Number(row.streamer_id))
        .filter((id) => Number.isInteger(id) && id > 0)
    )
  );

  if (streamerIds.length === 0) {
    return rows.map((row) => ({ ...row, streamer_image_url: null }));
  }

  const { data: streamers, error: streamerError } = await supabase
    .from("streamers")
    .select("id,image_url")
    .in("id", streamerIds);

  if (streamerError) {
    return rows.map((row) => ({ ...row, streamer_image_url: null }));
  }

  const imageByStreamerId = new Map(
    (streamers || []).map((streamer) => [streamer.id, streamer.image_url || null])
  );

  return rows.map((row) => ({
    ...row,
    streamer_image_url: imageByStreamerId.get(row.streamer_id) || null,
  }));
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
