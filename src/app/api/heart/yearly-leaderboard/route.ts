import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import type { StreamerHeartLeaderboardItem } from "@/types/heart";

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
  const { startIso, endIso } = getSeoulCurrentYearRange();

  const admin = createAdminClient(supabaseUrl, serviceRoleKey);

  const { data: historyRows, error: historyError } = await admin
    .from("streamer_heart_history")
    .select("to_streamer_id,amount")
    .gte("created_at", startIso)
    .lt("created_at", endIso);
  if (historyError) {
    return NextResponse.json({ message: "연간 하트 집계 조회에 실패했습니다." }, { status: 500 });
  }

  if (!historyRows || historyRows.length === 0) {
    return NextResponse.json([] satisfies StreamerHeartLeaderboardItem[]);
  }

  const totalByStreamerId = new Map<number, number>();
  historyRows.forEach((row) => {
    const streamerId = row.to_streamer_id;
    const amount = Number(row.amount || 0);
    if (!Number.isFinite(streamerId) || streamerId <= 0) return;
    totalByStreamerId.set(streamerId, (totalByStreamerId.get(streamerId) || 0) + amount);
  });

  const sortedTotals = Array.from(totalByStreamerId.entries())
    .map(([streamerId, totalReceived]) => ({ streamerId, totalReceived }))
    .filter((item) => item.totalReceived > 0)
    .sort((a, b) => b.totalReceived - a.totalReceived)
    .slice(0, limit);

  if (sortedTotals.length === 0) {
    return NextResponse.json([] satisfies StreamerHeartLeaderboardItem[]);
  }

  const streamerIds = sortedTotals.map((item) => item.streamerId);
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
      const streamer = streamerById.get(item.streamerId);
      if (!streamer) return null;
      return {
        streamer_id: item.streamerId,
        nickname: streamer.nickname,
        platform: streamer.platform,
        total_received: item.totalReceived,
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
