import { createClient as createAdminClient } from "@supabase/supabase-js";
import type {
  PublicUserDonationRankItem,
  PublicUserFavorites,
  PublicUserProfileData,
} from "@/types/public-user-profile";
import type { StarredCrew, StarredGroup, StarredStreamer } from "@/types/star";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const FAVORITES_LIMIT = 40;
const DONATION_RANK_LIMIT = 50;

const EMPTY_FAVORITES: PublicUserFavorites = {
  streamers: [],
  groups: [],
  crews: [],
};

function createAdmin() {
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createAdminClient(supabaseUrl, serviceRoleKey);
}

type AdminClient = NonNullable<ReturnType<typeof createAdmin>>;

function toNumberArray(values: Array<number | null | undefined>) {
  return values.filter((value): value is number => Number.isInteger(value) && Number(value) > 0);
}

async function fetchStarredStreamers(admin: AdminClient, userId: string) {
  const { data: starRows, error: starError } = await admin
    .from("user_star_streamers")
    .select("streamer_id,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(FAVORITES_LIMIT);

  if (starError || !starRows) return [] as StarredStreamer[];

  const streamerIds = toNumberArray(starRows.map((row: { streamer_id: number | null }) => row.streamer_id));
  if (streamerIds.length === 0) return [] as StarredStreamer[];

  const { data: streamers, error: streamerError } = await admin
    .from("streamers")
    .select("id,public_id,nickname,image_url,platform")
    .in("id", streamerIds);

  if (streamerError || !streamers) return [] as StarredStreamer[];

  const streamerById = new Map(
    (streamers as StarredStreamer[]).map((item) => [item.id, item])
  );

  return streamerIds
    .map((id) => streamerById.get(id))
    .filter((item): item is StarredStreamer => Boolean(item));
}

async function fetchStarredGroups(admin: AdminClient, userId: string) {
  const { data: starRows, error: starError } = await admin
    .from("user_star_groups")
    .select("group_id,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(FAVORITES_LIMIT);

  if (starError || !starRows) return [] as StarredGroup[];

  const groupIds = toNumberArray(starRows.map((row: { group_id: number | null }) => row.group_id));
  if (groupIds.length === 0) return [] as StarredGroup[];

  const { data: groups, error: groupError } = await admin
    .from("idol_groups")
    .select("id,group_code,name,image_url")
    .in("id", groupIds);

  if (groupError || !groups) return [] as StarredGroup[];

  const groupById = new Map(
    (groups as StarredGroup[]).map((item) => [item.id, item])
  );

  return groupIds
    .map((id) => groupById.get(id))
    .filter((item): item is StarredGroup => Boolean(item));
}

async function fetchStarredCrews(admin: AdminClient, userId: string) {
  const { data: starRows, error: starError } = await admin
    .from("user_star_crews")
    .select("crew_id,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(FAVORITES_LIMIT);

  if (starError || !starRows) return [] as StarredCrew[];

  const crewIds = toNumberArray(starRows.map((row: { crew_id: number | null }) => row.crew_id));
  if (crewIds.length === 0) return [] as StarredCrew[];

  const { data: crews, error: crewError } = await admin
    .from("crews")
    .select("id,crew_code,name,image_url")
    .in("id", crewIds);

  if (crewError || !crews) return [] as StarredCrew[];

  const crewById = new Map(
    (crews as StarredCrew[]).map((item) => [item.id, item])
  );

  return crewIds
    .map((id) => crewById.get(id))
    .filter((item): item is StarredCrew => Boolean(item));
}

async function fetchHeartPoint(admin: AdminClient, userId: string) {
  const { data, error } = await admin
    .from("heart_points")
    .select("point")
    .eq("id", userId)
    .maybeSingle();

  if (error) return 0;
  return Number(data?.point ?? 0);
}

async function fetchDonationRanksFallback(admin: AdminClient, userId: string) {
  const { data: donationRows, error: donationError } = await admin
    .from("streamer_top_donors")
    .select("streamer_id,donor_rank,total_sent,last_sent_at")
    .eq("user_id", userId)
    .order("total_sent", { ascending: false })
    .limit(DONATION_RANK_LIMIT);

  if (donationError || !donationRows) return [] as PublicUserDonationRankItem[];

  const streamerIds = toNumberArray(
    donationRows.map((row: { streamer_id: number | null }) => row.streamer_id)
  );
  if (streamerIds.length === 0) return [] as PublicUserDonationRankItem[];

  const { data: streamers, error: streamerError } = await admin
    .from("streamers")
    .select("id,public_id,nickname,image_url,platform")
    .in("id", streamerIds);

  if (streamerError || !streamers) return [] as PublicUserDonationRankItem[];

  const streamerById = new Map(
    (
      streamers as Array<{
        id: number;
        public_id: string | null;
        nickname: string | null;
        image_url: string | null;
        platform: string | null;
      }>
    ).map((item) => [item.id, item])
  );

  return donationRows
    .map((row: {
      streamer_id: number | null;
      donor_rank: number | null;
      total_sent: number | null;
      last_sent_at: string | null;
    }) => {
      if (!row.streamer_id || !row.donor_rank) return null;
      const streamer = streamerById.get(row.streamer_id);
      if (!streamer) return null;

      return {
        streamerId: row.streamer_id,
        streamerPublicId: streamer.public_id,
        streamerNickname: streamer.nickname,
        streamerImageUrl: streamer.image_url,
        streamerPlatform: streamer.platform,
        donorRank: row.donor_rank,
        totalSent: Number(row.total_sent || 0),
        lastSentAt: row.last_sent_at,
      } as PublicUserDonationRankItem;
    })
    .filter((item): item is PublicUserDonationRankItem => Boolean(item));
}

async function fetchDonationRanks(admin: AdminClient, userId: string) {
  const { data, error } = await admin
    .from("user_streamer_donation_ranks")
    .select(
      "user_id,streamer_id,streamer_public_id,streamer_nickname,streamer_image_url,streamer_platform,donor_rank,total_sent,last_sent_at"
    )
    .eq("user_id", userId)
    .order("total_sent", { ascending: false })
    .limit(DONATION_RANK_LIMIT);

  if (error) {
    // SQL 뷰 미적용 환경에서는 기존 로직으로 fallback
    if (error.code === "42P01") {
      return fetchDonationRanksFallback(admin, userId);
    }
    return [] as PublicUserDonationRankItem[];
  }

  return (data || [])
    .map((row) => {
      const streamerId = Number(row.streamer_id);
      const donorRank = Number(row.donor_rank);
      if (!Number.isInteger(streamerId) || streamerId <= 0) return null;
      if (!Number.isInteger(donorRank) || donorRank <= 0) return null;

      return {
        streamerId,
        streamerPublicId: row.streamer_public_id || null,
        streamerNickname: row.streamer_nickname || null,
        streamerImageUrl: row.streamer_image_url || null,
        streamerPlatform: row.streamer_platform || null,
        donorRank,
        totalSent: Number(row.total_sent || 0),
        lastSentAt: row.last_sent_at || null,
      } as PublicUserDonationRankItem;
    })
    .filter((item): item is PublicUserDonationRankItem => Boolean(item));
}

export async function fetchPublicUserProfileByPublicId(
  userPublicId: string,
  viewerUserId?: string | null
) {
  const admin = createAdmin();
  if (!admin) {
    throw new Error("서버 설정이 올바르지 않습니다.");
  }

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id,public_id,nickname,nickname_code,avatar_url,bio,email,created_at")
    .eq("public_id", userPublicId)
    .maybeSingle();

  if (profileError) throw profileError;
  if (!profile) return null;

  const userId = profile.id;
  const isOwner = Boolean(viewerUserId && viewerUserId === userId);

  const { data: privacyRow, error: privacyError } = await admin
    .from("user_profile_privacy")
    .select("show_account_info,show_favorites,show_donation_ranks")
    .eq("user_id", userId)
    .maybeSingle();

  // 보안 우선: privacy 조회 자체가 실패하면 owner 외에는 비공개로 처리(fail-closed)
  const canReadPrivacy = !privacyError;
  const canViewAccountInfo =
    isOwner || (canReadPrivacy ? Boolean(privacyRow?.show_account_info ?? true) : false);
  const canViewFavorites =
    isOwner || (canReadPrivacy ? Boolean(privacyRow?.show_favorites ?? true) : false);
  const canViewDonationRanks =
    isOwner || (canReadPrivacy ? Boolean(privacyRow?.show_donation_ranks ?? true) : false);

  const [favorites, donationRanks, heartPoint] = await Promise.all([
    canViewFavorites
      ? (async () => {
          const [streamers, groups, crews] = await Promise.all([
            fetchStarredStreamers(admin, userId),
            fetchStarredGroups(admin, userId),
            fetchStarredCrews(admin, userId),
          ]);
          return {
            streamers,
            groups,
            crews,
          } as PublicUserFavorites;
        })()
      : Promise.resolve(EMPTY_FAVORITES),
    canViewDonationRanks ? fetchDonationRanks(admin, userId) : Promise.resolve([]),
    canViewAccountInfo ? fetchHeartPoint(admin, userId) : Promise.resolve(0),
  ]);

  return {
    identity: {
      id: profile.id,
      nickname: profile.nickname,
      nicknameCode: profile.nickname_code,
      avatarUrl: profile.avatar_url,
      bio: profile.bio,
    },
    isOwner,
    canViewAccountInfo,
    canViewFavorites,
    canViewDonationRanks,
    accountInfo: canViewAccountInfo
      ? {
          email: profile.email,
          createdAt: profile.created_at,
          heartPoint,
        }
      : null,
    favorites,
    donationRanks,
  } as PublicUserProfileData;
}
