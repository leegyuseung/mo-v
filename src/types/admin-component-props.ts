import type {
  StreamerInfoEditRequest,
  StreamerRegistrationRequest,
} from "@/types/admin-requests";

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
