import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import type { StreamerHeartLeaderboardItem, StreamerYearlySnapshotRow } from "@/types/heart";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSeoulCurrentYearRange() {
  const now = new Date();
  const currentYear = Number(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Seoul",
      year: "numeric",
    }).format(now)
  );
  const startIso = new Date(`${currentYear}-01-01T00:00:00+09:00`).toISOString();
  const endIso = new Date(`${currentYear + 1}-01-01T00:00:00+09:00`).toISOString();
  return { startIso, endIso };
}

function parseLimit(searchParams: URLSearchParams) {
  const raw = Number(searchParams.get("limit") || "5");
  if (!Number.isFinite(raw)) return 5;
  return Math.min(100, Math.max(1, Math.floor(raw)));
}

export async function GET(request: Request) {
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ message: "서버 설정이 올바르지 않습니다." }, { status: 500 });
  }

  const url = new URL(request.url);
  const limit = parseLimit(url.searchParams);
  const { startIso } = getSeoulCurrentYearRange();
  const currentYear = Number(startIso.slice(0, 4));

  const admin = createAdminClient(supabaseUrl, serviceRoleKey);

  const { data: snapshotRows, error: snapshotError } = await admin.rpc(
    "get_streamer_heart_rank_snapshot",
    {
      p_period_type: "yearly",
      p_year: currentYear,
      p_month: 0,
      p_week_of_month: 0,
    }
  );

  if (snapshotError) {
    return NextResponse.json({ message: "연간 하트 집계 조회에 실패했습니다." }, { status: 500 });
  }

  const sortedTotals = ((snapshotRows || []) as StreamerYearlySnapshotRow[])
    .filter((item) => Number(item.rank) > 0 && Number(item.streamer_id) > 0)
    .sort((a, b) => a.rank - b.rank)
    .slice(0, limit);

  if (sortedTotals.length === 0) {
    return NextResponse.json([] satisfies StreamerHeartLeaderboardItem[]);
  }

  const streamerIds = sortedTotals.map((item) => item.streamer_id);
  const { data: streamerRows, error: streamerError } = await admin
    .from("streamers")
    .select("id,nickname,platform,image_url,public_id,group_name,crew_name")
    .in("id", streamerIds);
  if (streamerError) {
    return NextResponse.json({ message: "스트리머 정보 조회에 실패했습니다." }, { status: 500 });
  }

  const streamerById = new Map((streamerRows || []).map((streamer) => [streamer.id, streamer]));
  const result: StreamerHeartLeaderboardItem[] = sortedTotals
    .map((item) => {
      const streamer = streamerById.get(item.streamer_id);
      if (!streamer) return null;
      return {
        streamer_id: item.streamer_id,
        nickname: item.streamer_nickname || streamer.nickname,
        platform: streamer.platform,
        total_received: Number(item.total_received || 0),
        image_url: streamer.image_url,
        public_id: streamer.public_id,
        group_name: streamer.group_name,
        crew_name: streamer.crew_name,
      };
    })
    .filter((item): item is StreamerHeartLeaderboardItem => item !== null);

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
    },
  });
}
