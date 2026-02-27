import { createClient } from "@/utils/supabase/client";
import type { HomeShowcaseContent, HomeShowcaseData, HomeShowcaseStreamer } from "@/types/home";

const supabase = createClient();

const HOME_BIRTHDAY_SOON_DAYS = 3;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const NEW_BADGE_WINDOW_IN_MS = 2 * DAY_IN_MS;

type StreamerRow = {
  id: number;
  public_id: string;
  nickname: string | null;
  image_url: string | null;
  platform: string | null;
  birthday: string | null;
};

function isValidMonthDay(month: number, day: number) {
  return Number.isFinite(month) && Number.isFinite(day) && month >= 1 && month <= 12 && day >= 1 && day <= 31;
}

function parseMonthDay(value: string): { month: number; day: number } | null {
  const normalized = value.trim();

  const compactMatch = normalized.match(/^(\d{2})(\d{2})$/);
  if (compactMatch) {
    const month = Number(compactMatch[1]);
    const day = Number(compactMatch[2]);
    if (isValidMonthDay(month, day)) return { month, day };
  }

  const koreanMatch = normalized.match(/(\d{1,2})\s*월\s*(\d{1,2})\s*일/);
  if (koreanMatch) {
    const month = Number(koreanMatch[1]);
    const day = Number(koreanMatch[2]);
    if (isValidMonthDay(month, day)) return { month, day };
  }

  const matched = normalized.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (matched) {
    const month = Number(matched[2]);
    const day = Number(matched[3]);
    if (isValidMonthDay(month, day)) return { month, day };
  }

  const numericMonthDayMatch = normalized.match(/^(\d{1,2})[.\-/](\d{1,2})$/);
  if (numericMonthDayMatch) {
    const month = Number(numericMonthDayMatch[1]);
    const day = Number(numericMonthDayMatch[2]);
    if (isValidMonthDay(month, day)) return { month, day };
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) return null;
  return {
    month: parsed.getUTCMonth() + 1,
    day: parsed.getUTCDate(),
  };
}

function getDaysUntilBirthday(birthday: string | null): number | null {
  if (!birthday) return null;
  const monthDay = parseMonthDay(birthday);
  if (!monthDay) return null;

  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());

  let targetUtc = Date.UTC(currentYear, monthDay.month - 1, monthDay.day);
  if (targetUtc < todayUtc) {
    targetUtc = Date.UTC(currentYear + 1, monthDay.month - 1, monthDay.day);
  }

  return Math.floor((targetUtc - todayUtc) / (24 * 60 * 60 * 1000));
}

function formatMonthDayLabel(birthday: string | null): string | null {
  if (!birthday) return null;
  const monthDay = parseMonthDay(birthday);
  if (!monthDay) return null;
  return `${String(monthDay.month).padStart(2, "0")}.${String(monthDay.day).padStart(2, "0")}`;
}

function pickUpcomingBirthdayStreamers(rows: StreamerRow[]): HomeShowcaseStreamer[] {
  return rows
    .map((row) => ({
      ...row,
      daysUntilBirthday: getDaysUntilBirthday(row.birthday),
      birthdayLabel: formatMonthDayLabel(row.birthday),
    }))
    .filter((row) => row.daysUntilBirthday !== null && (row.daysUntilBirthday as number) <= HOME_BIRTHDAY_SOON_DAYS)
    .sort((a, b) => {
      const diff = (a.daysUntilBirthday as number) - (b.daysUntilBirthday as number);
      if (diff !== 0) return diff;
      return (a.nickname || "").localeCompare(b.nickname || "", "ko");
    })
    .map((row) => ({
      id: row.id,
      public_id: row.public_id,
      nickname: row.nickname,
      image_url: row.image_url,
      platform: row.platform,
      birthday: row.birthday,
      birthdayLabel: row.birthdayLabel,
      daysUntilBirthday: row.daysUntilBirthday,
    }));
}

function pickRandomRow(rows: StreamerRow[]): StreamerRow | null {
  if (rows.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * rows.length);
  return rows[randomIndex] || null;
}

function toHomeShowcaseStreamer(row: StreamerRow): HomeShowcaseStreamer {
  return {
    id: row.id,
    public_id: row.public_id,
    nickname: row.nickname,
    image_url: row.image_url,
    platform: row.platform,
    birthday: row.birthday,
    birthdayLabel: formatMonthDayLabel(row.birthday),
    daysUntilBirthday: getDaysUntilBirthday(row.birthday),
  };
}

async function fetchRecommendedStreamers(): Promise<HomeShowcaseStreamer[]> {
  const [soopResult, chzzkResult] = await Promise.all([
    supabase
      .from("streamers")
      .select("id,public_id,nickname,image_url,platform,birthday")
      .eq("platform", "soop"),
    supabase
      .from("streamers")
      .select("id,public_id,nickname,image_url,platform,birthday")
      .eq("platform", "chzzk"),
  ]);

  if (soopResult.error) throw soopResult.error;
  if (chzzkResult.error) throw chzzkResult.error;

  const soopRandom = pickRandomRow((soopResult.data || []) as StreamerRow[]);
  const chzzkRandom = pickRandomRow((chzzkResult.data || []) as StreamerRow[]);

  const recommendedRows = [soopRandom, chzzkRandom].filter(
    (row): row is StreamerRow => Boolean(row)
  );
  return recommendedRows.map(toHomeShowcaseStreamer);
}

async function fetchContentTitles(): Promise<HomeShowcaseContent[]> {
  const now = Date.now();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("contents")
    .select("id,title,participant_composition,created_at,recruitment_end_at")
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) throw error;

  const enriched = (data || []).map((row) => {
    const createdAt = new Date(row.created_at).getTime();
    const deadlineDate = row.recruitment_end_at ? new Date(row.recruitment_end_at) : null;
    if (deadlineDate) deadlineDate.setHours(0, 0, 0, 0);
    const dayDiff =
      deadlineDate && Number.isFinite(deadlineDate.getTime())
        ? Math.floor((deadlineDate.getTime() - todayStart.getTime()) / DAY_IN_MS)
        : null;

    return {
      ...row,
      createdAt,
      dayDiff,
    };
  });

  return enriched
    .sort((a, b) => {
      const aOrder = a.dayDiff === null ? Number.POSITIVE_INFINITY : Math.max(a.dayDiff, 0);
      const bOrder = b.dayDiff === null ? Number.POSITIVE_INFINITY : Math.max(b.dayDiff, 0);
      if (aOrder !== bOrder) return aOrder - bOrder;
      return b.createdAt - a.createdAt;
    })
    .map((row) => ({
      id: row.id,
      title: row.title,
      participant_composition: row.participant_composition,
      isNew: Number.isFinite(row.createdAt) && now - row.createdAt <= NEW_BADGE_WINDOW_IN_MS,
      isClosingSoon: row.dayDiff !== null && row.dayDiff >= 0 && row.dayDiff <= 3,
      daysUntilRecruitmentEnd: row.dayDiff,
    })) as HomeShowcaseContent[];
}

export async function fetchHomeShowcaseData(): Promise<HomeShowcaseData> {
  const { data: streamerRows, error: streamerError } = await supabase
    .from("streamers")
    .select("id,public_id,nickname,image_url,platform,birthday")
    .not("birthday", "is", null);

  if (streamerError) throw streamerError;

  const upcomingBirthdays = pickUpcomingBirthdayStreamers((streamerRows || []) as StreamerRow[]);
  const [recommendedStreamers, contentTitles] = await Promise.all([
    fetchRecommendedStreamers(),
    fetchContentTitles(),
  ]);

  return {
    upcomingBirthdays,
    recommendedStreamers,
    contentTitles,
  };
}
