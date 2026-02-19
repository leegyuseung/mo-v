/** 관리자 대시보드 통계 */
export type DashboardStats = {
    totalUsers: number;
    emailUsers: number;
    googleUsers: number;
    kakaoUsers: number;
    totalStreamers: number;
    totalGroups: number;
};

/** 스트리머 등록 요청 상태 */
export type StreamerRequestStatus =
    | "pending"
    | "approved"
    | "rejected"
    | "cancelled";

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
};
