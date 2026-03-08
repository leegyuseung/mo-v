import type { StreamerRegistrationRequest } from "@/types/admin-requests";

export type PendingStreamerRequestFormState = {
  nickname: string;
  imageUrl: string;
  chzzkId: string;
  soopId: string;
  groupNameInput: string;
  crewNameInput: string;
  supporters: string;
  birthday: string;
  nationality: string;
  gender: string;
  genreInput: string;
  firstStreamDate: string;
  fandomName: string;
  mbti: string;
  aliasInput: string;
  platformUrl: string;
  fancafeUrl: string;
  youtubeUrl: string;
};

export type PendingStreamerRequestFormField = keyof PendingStreamerRequestFormState;

export type PendingStreamerRequestFormParams = {
  request: StreamerRegistrationRequest;
};
