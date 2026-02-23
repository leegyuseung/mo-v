import { Tables } from "@/types/database.types";

/** crews 테이블의 Row 타입 */
export type Crew = Tables<"crews">;

/** 크루 CRUD 시 사용하는 입력 타입 */
export type CrewUpsertInput = {
  crew_code: string;
  name: string;
  leader: string | null;
  member_etc?: string[] | null;
  fandom_name: string | null;
  debut_at: string | null;
  fancafe_url: string | null;
  youtube_url: string | null;
  soop_url: string | null;
  chzzk_url: string | null;
  image_url: string | null;
  bg_color: string | null;
};

/** 크루 카드에 표시될 멤버 썸네일 정보 */
export type CrewMemberThumbnail = {
  id: number;
  public_id: string;
  nickname: string | null;
  image_url: string | null;
};

/** 크루 목록 카드 UI용 타입 (멤버 수 포함) */
export type CrewCard = {
  id: number;
  crew_code: string;
  name: string;
  image_url: string | null;
  bg_color: string | null;
  star_count: number;
  members: CrewMemberThumbnail[];
  member_count: number;
};

/** 크루 상세 화면용 타입 (멤버 상세 정보 포함) */
export type CrewDetail = {
  id: number;
  crew_code: string;
  name: string;
  members: string[];
  leader: string | null;
  member_etc: string[] | null;
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

/** 크루 정보 수정 요청 입력 타입 */
export type CreateCrewInfoEditRequestInput = {
  content: string;
  streamerId: number;
  crewName: string;
  requesterId: string;
  requesterNickname: string | null;
};

/** 크루 코드-이름 쌍 (드롭다운 등에 사용) */
export type CrewCodeName = {
  crew_code: string;
  name: string;
};

/** fetchCrewCards 내부에서 crews 테이블 쿼리 결과 매핑용 */
export type CrewRow = {
  id: number;
  crew_code: string;
  name: string;
  image_url: string | null;
  bg_color: string | null;
};

/** fetchCrewCards 내부에서 streamers 테이블 쿼리 결과 매핑용 */
export type StreamerCrewRow = {
  id: number;
  public_id: string;
  nickname: string | null;
  image_url: string | null;
  crew_name: string[] | null;
};

/** fetchCrewDetailByCode 내부에서 crews 테이블 전체 Row 매핑용 */
export type CrewDetailRow = {
  id: number;
  crew_code: string;
  name: string;
  members: string[];
  leader: string | null;
  member_etc: string[] | null;
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
};

/** 크루 상세 화면 컴포넌트에 전달하는 props */
export type CrewDetailScreenProps = {
  crewCode: string;
};
