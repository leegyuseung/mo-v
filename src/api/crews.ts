import { createClient } from "@/utils/supabase/client";
import type {
  CrewCodeName,
  CreateCrewInfoEditRequestInput,
  CrewCard,
  CrewDetail,
} from "@/types/crew";
import { STREAMER_INFO_EDIT_REQUEST_TABLE } from "@/lib/constant";

const supabase = createClient();

export async function fetchCrewCodeNames(): Promise<CrewCodeName[]> {
  const { data, error } = await (supabase as unknown as { from: (table: string) => any })
    .from("crews")
    .select("crew_code,name")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []) as CrewCodeName[];
}

type CrewRow = {
  id: number;
  crew_code: string;
  name: string;
  image_url: string | null;
  bg_color: string | null;
};

type StreamerCrewRow = {
  id: number;
  public_id: string;
  nickname: string | null;
  image_url: string | null;
  crew_name: string[] | null;
};

export async function fetchCrewCards(): Promise<CrewCard[]> {
  // `crews`는 최신 DB 스키마에 추가된 테이블이라 타입 생성 이전에도 동작하도록 로우 타입을 명시한다.
  const crewsQuery = (supabase as unknown as { from: (table: string) => any })
    .from("crews")
    .select("id,crew_code,name,image_url,bg_color")
    .order("name", { ascending: true });

  const streamersQuery = supabase
    .from("streamers")
    .select("id,public_id,nickname,image_url,crew_name");

  const [{ data: crews, error: crewsError }, { data: streamers, error: streamersError }] =
    await Promise.all([crewsQuery, streamersQuery]);

  if (crewsError) throw crewsError;
  if (streamersError) throw streamersError;

  const crewsData = (crews || []) as CrewRow[];
  const streamersData = (streamers || []) as StreamerCrewRow[];

  const membersByCrewCode = new Map<string, CrewCard["members"]>();
  crewsData.forEach((crew) => {
    membersByCrewCode.set(crew.crew_code.trim().toLowerCase(), []);
  });

  streamersData.forEach((streamer) => {
    const candidateValues = (streamer.crew_name || [])
      .map((value) => (value || "").trim().toLowerCase())
      .filter(Boolean);

    const uniqueCodes = new Set(candidateValues);
    uniqueCodes.forEach((code) => {
      const existing = membersByCrewCode.get(code);
      if (!existing) return;
      existing.push({
        id: streamer.id,
        public_id: streamer.public_id,
        nickname: streamer.nickname,
        image_url: streamer.image_url,
      });
    });
  });

  return crewsData.map((crew) => {
    const code = crew.crew_code.trim().toLowerCase();
    const members = membersByCrewCode.get(code) || [];

    return {
      id: crew.id,
      crew_code: crew.crew_code,
      name: crew.name,
      image_url: crew.image_url,
      bg_color: crew.bg_color,
      members,
      member_count: members.length,
    };
  });
}

type CrewDetailRow = {
  id: number;
  crew_code: string;
  name: string;
  members: string[];
  leader: string | null;
  fandom_name: string | null;
  debut_at: string | null;
  fancafe_url: string | null;
  youtube_url: string | null;
  soop_url: string | null;
  chzzk_url: string | null;
  image_url: string | null;
  bg_color: string | null;
  created_at: string;
  updated_at: string | null;
};

export async function fetchCrewDetailByCode(
  crewCode: string
): Promise<CrewDetail | null> {
  const normalizedCode = crewCode.trim().toLowerCase();

  const crewQuery = (supabase as unknown as { from: (table: string) => any })
    .from("crews")
    .select("*")
    .ilike("crew_code", normalizedCode)
    .maybeSingle();

  const streamersQuery = supabase
    .from("streamers")
    .select("id,public_id,nickname,image_url,crew_name");

  const [{ data: crew, error: crewError }, { data: streamers, error: streamersError }] =
    await Promise.all([crewQuery, streamersQuery]);

  if (crewError) throw crewError;
  if (!crew) return null;
  if (streamersError) throw streamersError;

  const members =
    (streamers || [])
      .filter((streamer) => {
        const values = (streamer.crew_name || [])
          .map((value: string) => (value || "").trim().toLowerCase())
          .filter(Boolean);
        return values.includes(normalizedCode);
      })
      .map((streamer) => ({
        id: streamer.id,
        public_id: streamer.public_id,
        nickname: streamer.nickname,
        image_url: streamer.image_url,
      })) || [];

  return {
    ...(crew as CrewDetailRow),
    members_detail: members,
  };
}

export async function createCrewInfoEditRequest({
  content,
  streamerId,
  crewName,
  requesterId,
  requesterNickname,
}: CreateCrewInfoEditRequestInput) {
  const trimmedContent = content.trim();
  if (!trimmedContent) {
    throw new Error("수정 요청 내용을 입력해 주세요.");
  }

  const { error } = await supabase.from(STREAMER_INFO_EDIT_REQUEST_TABLE).insert({
    content: trimmedContent,
    streamer_id: streamerId,
    streamer_nickname: `[CREW] ${crewName}`,
    requester_id: requesterId,
    requester_nickname: requesterNickname,
  });

  if (error) throw error;
}
