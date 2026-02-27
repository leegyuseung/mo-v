import type { Enums, Tables, TablesInsert, TablesUpdate } from "@/types/database.types";

export type ContentType =
  "게임"
  | "노래"
  | "미술"
  | "대회"
  | "아이돌"
  | "크루"
  | "동아리"
  | "음악"
  | "댄스"
  | "토크"
  | "VRChat"
  | "테스트"
  | "더빙"
  | "취미"
  | "운세"
  | "스포츠"
  | "분석"
  | "광고"
  | "기타";


export type ContentType2 =
  "VRChat"
  | "테스트"
  | "더빙"
  | "취미"
  | "운세"
  | "스포츠"
  | "분석"
  | "광고"
  | "기타";

export type ParticipantComposition = Enums<"participant_composition_enum">;
export type ContentStatus =
  | "pending"
  | "approved"
  | "ended"
  | "rejected"
  | "cancelled"
  | "deleted";

export type Content = Tables<"contents">;
export type ContentInsert = TablesInsert<"contents">;
export type ContentUpdate = TablesUpdate<"contents">;

export type ContentWithAuthorProfile = Content & {
  author_profile: {
    nickname: string | null;
  } | null;
};

export type ContentDetailScreenProps = {
  content: Content;
  nowTimestamp: number;
  initialIsLiked: boolean;
};

export type CreateContentInfoEditRequestInput = {
  content: string;
  contentId: number;
  contentTitle: string;
  requesterId: string;
  requesterNickname: string | null;
};

export type ContentCreateInput = {
  title: string;
  image_url: string | null;
  application_url: string;
  content_type: ContentType[];
  participant_composition: ParticipantComposition;
  status: ContentStatus;
  host_name: string | null;
  host_organization: string | null;
  reward: string | null;
  recruitment_start_at: string | null;
  recruitment_end_at: string | null;
  content_start_at: string | null;
  content_end_at: string | null;
  min_participants: number | null;
  max_participants: number | null;
  participation_requirement: string | null;
  description: string | null;
  review_note?: string | null;
  contact_email: string | null;
  contact_discord: string | null;
  contact_other: string | null;
};

export type ContentUpdateInput = Partial<ContentCreateInput> &
  Pick<ContentUpdate, "updated_at" | "updated_by" | "deleted_at" | "deleted_by">;

export const CONTENT_TYPE_OPTIONS: ContentType[] = [
  "게임",
  "노래",
  "미술",
  "대회",
  "아이돌",
  "크루",
  "동아리",
  "음악",
  "댄스",
  "토크",
];

export const CONTENT_TYPE_OPTIONS2: ContentType2[] = [
  "VRChat",
  "테스트",
  "더빙",
  "취미",
  "운세",
  "스포츠",
  "분석",
  "광고",
  "기타",
];

export const PARTICIPANT_COMPOSITION_OPTIONS: ParticipantComposition[] = [
  "버츄얼포함",
  "버츄얼만",
];
