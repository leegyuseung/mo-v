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
  totalLiveBoxes: number;
  pendingStreamerRequests: number;
  pendingInfoEditRequests: number;
  pendingReportRequests: number;
  pendingLiveBoxRequests: number;
  signupTrend: DashboardSignupTrendPoint[];
};
