import type { LiveBoxStatus } from "@/types/live-box";

export type LiveBoxParticipantCandidate = {
  streamerId: number;
  platformId: string;
  platformLabel: "CHZZK" | "SOOP";
  nickname: string | null;
};

export type LiveBoxFormSubmitPayload = {
  title: string;
  category: string[];
  participant_streamer_ids: string[];
  ends_at: string | null;
  description: string | null;
  status: LiveBoxStatus;
};
