/** 관리자 대시보드 통계 */
export type DashboardSignupTrendPoint = {
    /** UTC 기준 날짜 (YYYY-MM-DD) */
    date: string;
    total: number;
    email: number;
    google: number;
    kakao: number;
};

/** 관리자 대시보드 통계 */
export type DashboardStats = {
    totalUsers: number;
    emailUsers: number;
    googleUsers: number;
    kakaoUsers: number;
    totalStreamers: number;
    totalGroups: number;
    totalCrews: number;
    pendingStreamerRequests: number;
    pendingInfoEditRequests: number;
    pendingReportRequests: number;
    signupTrend: DashboardSignupTrendPoint[];
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
};

/* ─── Admin UI 컴포넌트 Props ─── */

/** 대시보드 섹션 타이틀 props */
export type SectionTitleProps = {
    title: string;
    description: string;
};

/** 대시보드 통계 카드 props */
export type StatCardProps = {
    title: string;
    value: number;
    icon: import("lucide-react").LucideIcon;
    color: string;
    bgLight: string;
    textColor: string;
    ratioBase: number;
    unit?: string;
};

/** 버츄얼 등록 대기 행 props */
export type RequestRowProps = {
    request: StreamerRegistrationRequest;
};

/** 정보 수정 요청 행 props */
export type InfoEditRequestRowProps = {
    request: StreamerInfoEditRequest;
};
