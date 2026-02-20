export type StarredStreamer = {
  id: number;
  public_id: string | null;
  nickname: string | null;
  image_url: string | null;
  platform: string | null;
};

export type StarredGroup = {
  id: number;
  group_code: string;
  name: string;
  image_url: string | null;
};

export type StarredCrew = {
  id: number;
  crew_code: string;
  name: string;
  image_url: string | null;
};

export type MyStars = {
  streamers: StarredStreamer[];
  groups: StarredGroup[];
  crews: StarredCrew[];
};
