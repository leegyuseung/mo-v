import type { LiveBox } from "@/types/live-box";

export type EntityParticipatingLiveBoxMember = {
  id: number;
  public_id: string;
  nickname: string | null;
  image_url: string | null;
  chzzk_id?: string | null;
  soop_id?: string | null;
};

export type EntityParticipatingLiveBoxesSectionProps = {
  title: string;
  members: EntityParticipatingLiveBoxMember[];
};

export type EntityParticipatingLiveBoxCard = {
  liveBox: LiveBox;
  matchedMembers: EntityParticipatingLiveBoxMember[];
};
