import { createClient } from "@/utils/supabase/client";
import type {
  CreateGroupInfoEditRequestInput,
  IdolGroupCard,
  IdolGroupCodeName,
  IdolGroupDetail,
} from "@/types/group";
import { ENTITY_INFO_EDIT_REQUEST_TABLE } from "@/lib/constant";

const supabase = createClient();

export async function fetchIdolGroupCodeNames(): Promise<IdolGroupCodeName[]> {
  const { data, error } = await supabase
    .from("idol_groups")
    .select("group_code,name")
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }

  return (data || []) as IdolGroupCodeName[];
}

export async function fetchIdolGroupCards(): Promise<IdolGroupCard[]> {
  const [
    { data: groups, error: groupsError },
    { data: streamers, error: streamersError },
    { data: groupStats, error: groupStatsError },
  ] =
    await Promise.all([
      supabase
        .from("idol_groups")
        .select("id,group_code,name,image_url,bg_color")
        .order("name", { ascending: true }),
      supabase
        .from("streamers")
        .select("id,public_id,nickname,image_url,group_codes,group_name"),
      supabase
        .from("group_star_stats")
        .select("group_id,star_count"),
    ]);

  if (groupsError) throw groupsError;
  if (streamersError) throw streamersError;
  if (groupStatsError) throw groupStatsError;

  const groupsData = groups || [];
  const streamersData = streamers || [];
  const groupStarCountById = new Map<number, number>(
    (groupStats || [])
      .filter((row) => typeof row.group_id === "number")
      .map((row) => [row.group_id as number, row.star_count || 0])
  );

  const membersByGroupCode = new Map<string, IdolGroupCard["members"]>();

  groupsData.forEach((group) => {
    membersByGroupCode.set(group.group_code.trim().toLowerCase(), []);
  });

  streamersData.forEach((streamer) => {
    const candidateValues = [...(streamer.group_codes || []), ...(streamer.group_name || [])]
      .map((value) => (value || "").trim().toLowerCase())
      .filter(Boolean);

    const uniqueCodes = new Set(candidateValues);
    uniqueCodes.forEach((code) => {
      const existing = membersByGroupCode.get(code);
      if (!existing) return;
      existing.push({
        id: streamer.id,
        public_id: streamer.public_id,
        nickname: streamer.nickname,
        image_url: streamer.image_url,
      });
    });
  });

  return groupsData.map((group) => {
    const code = group.group_code.trim().toLowerCase();
    const members = membersByGroupCode.get(code) || [];

    return {
      id: group.id,
      group_code: group.group_code,
      name: group.name,
      image_url: group.image_url,
      bg_color: group.bg_color ?? null,
      star_count: groupStarCountById.get(group.id) || 0,
      members,
      member_count: members.length,
    };
  });
}

export async function fetchIdolGroupDetailByCode(
  groupCode: string
): Promise<IdolGroupDetail | null> {
  const normalizedCode = groupCode.trim().toLowerCase();

  const [{ data: group, error: groupError }, { data: streamers, error: streamersError }] =
    await Promise.all([
      supabase
        .from("idol_groups")
        .select("*")
        .ilike("group_code", normalizedCode)
        .maybeSingle(),
      supabase
        .from("streamers")
        .select("id,public_id,nickname,image_url,group_codes,group_name"),
    ]);

  if (groupError) throw groupError;
  if (!group) return null;
  if (streamersError) throw streamersError;

  const members =
    (streamers || [])
      .filter((streamer) => {
        const values = [...(streamer.group_codes || []), ...(streamer.group_name || [])]
          .map((value) => (value || "").trim().toLowerCase())
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
    ...group,
    members_detail: members,
  };
}

export async function createGroupInfoEditRequest({
  content,
  groupId,
  groupCode,
  groupName,
  requesterId,
  requesterNickname,
}: CreateGroupInfoEditRequestInput) {
  const trimmedContent = content.trim();
  if (!trimmedContent) {
    throw new Error("수정 요청 내용을 입력해 주세요.");
  }

  const { error } = await supabase.from(ENTITY_INFO_EDIT_REQUEST_TABLE).insert({
    target_type: "group",
    target_id: groupId,
    target_code: groupCode,
    target_name: groupName,
    content: trimmedContent,
    requester_id: requesterId,
    requester_nickname: requesterNickname,
    status: "pending",
  });

  if (error) throw error;
}
