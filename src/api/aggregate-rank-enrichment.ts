import type { AggregateRankSnapshotRow } from "@/types/aggregate-rank";

type SupabaseLikeClient = {
  from: (table: string) => {
    select: (columns: string) => {
      in: (
        column: string,
        values: Array<string | number>
      ) => PromiseLike<{ data: unknown[] | null; error: { message?: string } | null }>;
    };
  };
};

function emptyEnrichedRows(rows: AggregateRankSnapshotRow[]) {
  return rows.map((row) => ({
    ...row,
    streamer_image_url: null,
    top_donor_public_id: null,
    top_donor_avatar_url: null,
  }));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toNullableString(value: unknown) {
  return typeof value === "string" ? value : null;
}

/**
 * 집계 스냅샷에 표시용 메타(스트리머 이미지, 최다 기부 유저 public_id/avatar)를 보강한다.
 * 클라이언트/서버에서 동일한 보강 규칙을 사용하기 위해 공통화한다.
 */
export async function enrichAggregateRankRows(
  supabaseClient: unknown,
  rows: AggregateRankSnapshotRow[]
) {
  const supabase = supabaseClient as SupabaseLikeClient;
  const streamerIds = Array.from(
    new Set(
      rows
        .map((row) => Number(row.streamer_id))
        .filter((id) => Number.isInteger(id) && id > 0)
    )
  );

  if (streamerIds.length === 0) return emptyEnrichedRows(rows);

  const { data: streamers, error: streamerError } = await supabase
    .from("streamers")
    .select("id,image_url")
    .in("id", streamerIds);

  if (streamerError) return emptyEnrichedRows(rows);

  const imageByStreamerId = new Map<number, string | null>();
  for (const streamer of streamers || []) {
    if (!isRecord(streamer)) continue;
    const streamerId = Number(streamer.id);
    if (!Number.isInteger(streamerId) || streamerId <= 0) continue;
    imageByStreamerId.set(streamerId, toNullableString(streamer.image_url));
  }

  const topDonorUserIds = Array.from(
    new Set(
      rows
        .map((row) => row.top_donor_user_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0)
    )
  );

  const profileByTopDonorUserId = new Map<string, { publicId: string | null; avatarUrl: string | null }>();
  if (topDonorUserIds.length > 0) {
    const { data: topDonorProfiles } = await supabase
      .from("profiles")
      .select("id,public_id,avatar_url")
      .in("id", topDonorUserIds);

    for (const profile of topDonorProfiles || []) {
      if (!isRecord(profile)) continue;
      const rawId = profile.id;
      if (typeof rawId !== "string" && typeof rawId !== "number") continue;
      const userId = String(rawId);
      profileByTopDonorUserId.set(userId, {
        publicId: toNullableString(profile.public_id),
        avatarUrl: toNullableString(profile.avatar_url),
      });
    }
  }

  return rows.map((row) => ({
    ...row,
    streamer_image_url: imageByStreamerId.get(row.streamer_id) || null,
    top_donor_public_id: row.top_donor_user_id
      ? profileByTopDonorUserId.get(row.top_donor_user_id)?.publicId || null
      : null,
    top_donor_avatar_url: row.top_donor_user_id
      ? profileByTopDonorUserId.get(row.top_donor_user_id)?.avatarUrl || null
      : null,
  }));
}
