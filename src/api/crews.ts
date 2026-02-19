import { createClient } from "@/utils/supabase/client";
import type {
  CrewCodeName,
  CreateCrewInfoEditRequestInput,
  CrewCard,
  CrewDetail,
  CrewRow,
  StreamerCrewRow,
  CrewDetailRow,
} from "@/types/crew";
import { STREAMER_INFO_EDIT_REQUEST_TABLE } from "@/lib/constant";

const supabase = createClient();

/** 크루 코드-이름 쌍 목록을 이름순으로 조회한다 (드롭다운 등에 사용) */
export async function fetchCrewCodeNames(): Promise<CrewCodeName[]> {
  const { data, error } = await supabase
    .from("crews")
    .select("crew_code,name")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []) as CrewCodeName[];
}

/** 크루 카드 목록을 조회한다. 각 크루에 crew_name 기반 멤버 썸네일을 매칭하여 반환한다 */
export async function fetchCrewCards(): Promise<CrewCard[]> {
  const crewsQuery = supabase
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

/** crewCode로 크루 상세 정보를 조회한다. 멤버 상세 정보도 함께 반환한다 */
export async function fetchCrewDetailByCode(
  crewCode: string
): Promise<CrewDetail | null> {
  const normalizedCode = crewCode.trim().toLowerCase();

  const crewQuery = supabase
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

/**
 * 크루 정보 수정 요청을 생성한다.
 * streamer_info_edit_requests 테이블을 재사용하며, streamer_nickname에 [CREW] prefix를 사용해 구분한다
 */
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
