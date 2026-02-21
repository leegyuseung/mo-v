import { Tables } from "@/types/database.types";

export type IdolGroup = Tables<"idol_groups">;

export type IdolGroupCodeName = {
  group_code: string;
  name: string;
};

export type IdolGroupMemberThumbnail = {
  id: number;
  public_id: string;
  nickname: string | null;
  image_url: string | null;
};

export type IdolGroupCard = {
  id: number;
  group_code: string;
  name: string;
  image_url: string | null;
  bg_color: string | null;
  star_count: number;
  members: IdolGroupMemberThumbnail[];
  member_count: number;
};

export type IdolGroupDetail = Tables<"idol_groups"> & {
  members_detail: IdolGroupMemberThumbnail[];
};

export type CreateGroupInfoEditRequestInput = {
  content: string;
  streamerId: number;
  groupName: string;
  requesterId: string;
  requesterNickname: string | null;
};

/** 그룹 CRUD 시 사용하는 입력 타입 */
export type IdolGroupUpsertInput = {
  group_code: string;
  name: string;
  leader: string | null;
  member_etc?: string[] | null;
  fandom_name: string | null;
  agency: string | null;
  formed_at: string | null;
  debut_at: string | null;
  fancafe_url: string | null;
  youtube_url: string | null;
  image_url: string | null;
  bg_color: string | null;
};
