export type CrewMemberThumbnail = {
  id: number;
  public_id: string;
  nickname: string | null;
  image_url: string | null;
};

export type CrewCard = {
  id: number;
  crew_code: string;
  name: string;
  image_url: string | null;
  bg_color: string | null;
  members: CrewMemberThumbnail[];
  member_count: number;
};

export type CrewDetail = {
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
  members_detail: CrewMemberThumbnail[];
};

export type CreateCrewInfoEditRequestInput = {
  content: string;
  streamerId: number;
  crewName: string;
  requesterId: string;
  requesterNickname: string | null;
};

export type CrewCodeName = {
  crew_code: string;
  name: string;
};
