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
  bg_color: boolean | null;
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
