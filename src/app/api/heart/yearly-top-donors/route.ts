import { NextResponse } from "next/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import type { StreamerTopDonor } from "@/types/profile";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSeoulCurrentYearRange() {
  const year = Number(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Seoul",
      year: "numeric",
    }).format(new Date())
  );

  return {
    startIso: new Date(`${year}-01-01T00:00:00+09:00`).toISOString(),
    endIso: new Date(`${year + 1}-01-01T00:00:00+09:00`).toISOString(),
  };
}

function parsePositiveInt(searchParams: URLSearchParams, key: string, fallback: number, min = 0, max = 100) {
  const raw = Number(searchParams.get(key) || String(fallback));
  if (!Number.isFinite(raw)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(raw)));
}

export async function GET(request: Request) {
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ message: "서버 설정이 올바르지 않습니다." }, { status: 500 });
  }

  const url = new URL(request.url);
  const streamerId = parsePositiveInt(url.searchParams, "streamerId", 0, 1, Number.MAX_SAFE_INTEGER);
  const limit = parsePositiveInt(url.searchParams, "limit", 20, 1, 100);
  const offset = parsePositiveInt(url.searchParams, "offset", 0, 0, 10000);

  if (!streamerId) {
    return NextResponse.json({ message: "streamerId는 필수입니다." }, { status: 400 });
  }

  const { startIso, endIso } = getSeoulCurrentYearRange();
  const admin = createAdminClient(supabaseUrl, serviceRoleKey);

  const { data: historyRows, error: historyError } = await admin
    .from("streamer_heart_history")
    .select("from_user_id,amount,created_at")
    .eq("to_streamer_id", streamerId)
    .gte("created_at", startIso)
    .lt("created_at", endIso);

  if (historyError) {
    return NextResponse.json({ message: "연간 후원 집계 조회에 실패했습니다." }, { status: 500 });
  }

  if (!historyRows || historyRows.length === 0) {
    return NextResponse.json({ data: [] satisfies StreamerTopDonor[], count: 0 });
  }

  const totalsByUserId = new Map<string, { totalSent: number; lastSentAt: string }>();
  historyRows.forEach((row) => {
    if (!row.from_user_id) return;
    const previous = totalsByUserId.get(row.from_user_id);
    const amount = Number(row.amount || 0);

    if (!previous) {
      totalsByUserId.set(row.from_user_id, {
        totalSent: amount,
        lastSentAt: row.created_at,
      });
      return;
    }

    totalsByUserId.set(row.from_user_id, {
      totalSent: previous.totalSent + amount,
      lastSentAt: previous.lastSentAt > row.created_at ? previous.lastSentAt : row.created_at,
    });
  });

  const sorted = Array.from(totalsByUserId.entries())
    .map(([userId, summary]) => ({
      userId,
      totalSent: summary.totalSent,
      lastSentAt: summary.lastSentAt,
    }))
    .sort((a, b) => {
      if (b.totalSent !== a.totalSent) return b.totalSent - a.totalSent;
      return a.userId.localeCompare(b.userId);
    });

  if (sorted.length === 0) {
    return NextResponse.json({ data: [] satisfies StreamerTopDonor[], count: 0 });
  }

  const sliced = sorted.slice(offset, offset + limit);
  const slicedUserIds = sliced.map((item) => item.userId);

  const { data: profiles, error: profileError } = await admin
    .from("profiles")
    .select("id,nickname,nickname_code")
    .in("id", slicedUserIds);

  if (profileError) {
    return NextResponse.json({ message: "후원자 프로필 조회에 실패했습니다." }, { status: 500 });
  }

  const profileById = new Map((profiles || []).map((profile) => [profile.id, profile]));
  const data: StreamerTopDonor[] = sliced.map((item, index) => {
    const donor = profileById.get(item.userId);
    return {
      donor_rank: offset + index + 1,
      last_sent_at: item.lastSentAt,
      streamer_id: streamerId,
      total_sent: item.totalSent,
      user_id: item.userId,
      user_nickname: donor?.nickname || null,
      user_nickname_code: donor?.nickname_code || null,
    };
  });

  return NextResponse.json(
    { data, count: sorted.length },
    {
      headers: {
        "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
      },
    }
  );
}
