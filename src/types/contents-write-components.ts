import type { ChangeEvent, Dispatch, SetStateAction } from "react";
import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { ContentType, ParticipantComposition } from "@/types/content";
import type { ContentsWriteContactFormValues } from "@/types/contents-write";

export type ContentsWriteMainFieldsProps = {
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
  titleError: string;
  setTitleError: Dispatch<SetStateAction<string>>;
  applicationUrl: string;
  setApplicationUrl: Dispatch<SetStateAction<string>>;
  applicationUrlError: string;
  setApplicationUrlError: Dispatch<SetStateAction<string>>;
  getApplicationUrlErrorMessage: (value: string) => string;
  contentTypes: ContentType[];
  onToggleType: (type: ContentType) => void;
  participantComposition: ParticipantComposition;
  setParticipantComposition: Dispatch<SetStateAction<ParticipantComposition>>;
  hostName: string;
  setHostName: Dispatch<SetStateAction<string>>;
  hostOrganization: string;
  setHostOrganization: Dispatch<SetStateAction<string>>;
  reward: string;
  setReward: Dispatch<SetStateAction<string>>;
  recruitmentStart: string;
  setRecruitmentStart: Dispatch<SetStateAction<string>>;
  recruitmentEnd: string;
  setRecruitmentEnd: Dispatch<SetStateAction<string>>;
  recruitmentScheduleError: string;
  setRecruitmentScheduleError: Dispatch<SetStateAction<string>>;
  contentStart: string;
  setContentStart: Dispatch<SetStateAction<string>>;
  contentEnd: string;
  setContentEnd: Dispatch<SetStateAction<string>>;
  contentScheduleError: string;
  setContentScheduleError: Dispatch<SetStateAction<string>>;
  minParticipants: string;
  setMinParticipants: Dispatch<SetStateAction<string>>;
  maxParticipants: string;
  setMaxParticipants: Dispatch<SetStateAction<string>>;
  normalizeParticipantCount: (raw: string, fallback: string) => string;
  participationRequirement: string;
  setParticipationRequirement: Dispatch<SetStateAction<string>>;
  description: string;
  setDescription: Dispatch<SetStateAction<string>>;
  register: UseFormRegister<ContentsWriteContactFormValues>;
  formErrors: FieldErrors<ContentsWriteContactFormValues>;
  discord: string;
  setDiscord: Dispatch<SetStateAction<string>>;
  otherContact: string;
  setOtherContact: Dispatch<SetStateAction<string>>;
};

export type ContentsWriteCoreSectionProps = Pick<
  ContentsWriteMainFieldsProps,
  | "title"
  | "setTitle"
  | "titleError"
  | "setTitleError"
  | "applicationUrl"
  | "setApplicationUrl"
  | "applicationUrlError"
  | "setApplicationUrlError"
  | "getApplicationUrlErrorMessage"
  | "contentTypes"
  | "onToggleType"
  | "participantComposition"
  | "setParticipantComposition"
>;

export type ContentsWriteScheduleHostSectionProps = Pick<
  ContentsWriteMainFieldsProps,
  | "hostName"
  | "setHostName"
  | "hostOrganization"
  | "setHostOrganization"
  | "reward"
  | "setReward"
  | "recruitmentStart"
  | "setRecruitmentStart"
  | "recruitmentEnd"
  | "setRecruitmentEnd"
  | "recruitmentScheduleError"
  | "setRecruitmentScheduleError"
  | "contentStart"
  | "setContentStart"
  | "contentEnd"
  | "setContentEnd"
  | "contentScheduleError"
  | "setContentScheduleError"
  | "minParticipants"
  | "setMinParticipants"
  | "maxParticipants"
  | "setMaxParticipants"
  | "normalizeParticipantCount"
>;

export type ContentsWriteDetailContactSectionProps = Pick<
  ContentsWriteMainFieldsProps,
  | "participationRequirement"
  | "setParticipationRequirement"
  | "description"
  | "setDescription"
  | "register"
  | "formErrors"
  | "discord"
  | "setDiscord"
  | "otherContact"
  | "setOtherContact"
>;

export type ContentsWriteImagePanelProps = {
  isSubmitting: boolean;
  isUploadingImage: boolean;
  posterFilePreview: string | null;
  onSelectPosterFile: (event: ChangeEvent<HTMLInputElement>) => void;
  onClickCancel: () => void;
};
