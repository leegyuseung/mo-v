import type { Tables, TablesInsert } from "@/types/database.types";
import type { Streamer } from "@/types/streamer";

export type LiveBoxStatus = "대기" | "진행중" | "종료";

export type LiveBox = Tables<"live_box">;

export type LiveBoxInsert = TablesInsert<"live_box">;

/** 관리자에서 박스 생성 시 사용하는 입력 타입 */
export type LiveBoxCreateInput = {
  title: string;
  category: string[];
  participant_streamer_ids: string[];
  ends_at: string | null;
  description: string | null;
  status: LiveBoxStatus;
};

/** 관리자에서 박스 수정 시 사용하는 입력 타입 */
export type LiveBoxUpdateInput = LiveBoxCreateInput;

/** 라이브박스 참여자 미리보기 렌더링에 필요한 최소 스트리머 타입 */
export type LiveBoxParticipantProfile = Pick<
  Streamer,
  "id" | "nickname" | "image_url" | "chzzk_id" | "soop_id"
>;
