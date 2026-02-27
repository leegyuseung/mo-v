export type HomeShowcaseStreamer = {
  id: number;
  public_id: string;
  nickname: string | null;
  image_url: string | null;
  platform: string | null;
  birthday?: string | null;
  daysUntilBirthday?: number | null;
};

export type HomeShowcaseContent = {
  id: number;
  title: string;
  participant_composition: string;
  isNew: boolean;
  isClosingSoon: boolean;
  daysUntilRecruitmentEnd: number | null;
};

export type HomeShowcaseData = {
  upcomingBirthdays: HomeShowcaseStreamer[];
  recommendedStreamers: HomeShowcaseStreamer[];
  contentTitles: HomeShowcaseContent[];
};
