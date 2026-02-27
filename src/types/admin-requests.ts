/** 스트리머/정보수정/신고/박스 요청 공통 상태 */
export type AdminRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

/** 스트리머 등록 요청 상태 */
export type StreamerRequestStatus = AdminRequestStatus;

/** 라이브박스 등록 요청 상태 */
export type LiveBoxRequestStatus = AdminRequestStatus;

/** 스트리머 등록 요청 데이터 */
export type StreamerRegistrationRequest = {
  id: number;
  requester_id: string;
  platform: "chzzk" | "soop";
  platform_streamer_id: string;
  platform_streamer_url: string | null;
  status: StreamerRequestStatus;
  created_at: string;
  updated_at?: string | null;
  reviewed_at?: string | null;
  review_note?: string | null;
  reviewed_by?: string | null;
};

/** 라이브박스 등록 요청 데이터 */
export type LiveBoxRegistrationRequest = {
  id: number;
  requester_id: string;
  topic: string;
  related_site: string;
  status: LiveBoxRequestStatus;
  created_at: string;
  reviewed_at?: string | null;
  review_note?: string | null;
  reviewed_by?: string | null;
};

/** 치지직 채널 프로필 조회 결과 */
export type ChzzkChannelProfile = {
  channelName: string | null;
  channelImageUrl: string | null;
};

/** 스트리머/그룹/크루 정보 수정 요청 데이터 */
export type StreamerInfoEditRequest = {
  id: number;
  created_at: string;
  content: string;
  streamer_id: number;
  streamer_nickname: string;
  requester_id: string;
  requester_nickname: string | null;
  status: AdminRequestStatus;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  review_note?: string | null;
};

/** 그룹/크루 정보 수정 요청 데이터 */
export type EntityInfoEditRequest = {
  id: number;
  created_at: string;
  content: string;
  target_type: "group" | "crew" | "contents";
  target_id: number;
  target_code: string | null;
  target_name: string;
  requester_id: string;
  requester_nickname: string | null;
  status: AdminRequestStatus;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  review_note?: string | null;
};

/** 버츄얼/그룹/소속 신고 요청 데이터 */
export type EntityReportRequest = {
  id: number;
  created_at: string;
  target_type: "streamer" | "group" | "crew";
  target_code: string;
  target_name: string | null;
  reporter_id: string;
  reporter_nickname: string | null;
  content: string;
  status: AdminRequestStatus;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  review_note?: string | null;
};
