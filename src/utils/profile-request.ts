import type {
  MyEntityReportRequest,
  ProfileRequestStatus,
} from "@/types/profile";

/** 서버에서 내려오는 문자열 상태를 화면 공통 상태 타입으로 정규화한다. */
export function normalizeProfileRequestStatus(status: string): ProfileRequestStatus {
  if (status === "approved") return "approved";
  if (status === "rejected") return "rejected";
  if (status === "cancelled") return "cancelled";
  return "pending";
}

export function getProfileRequestStatusLabel(status: ProfileRequestStatus) {
  if (status === "approved") return "확인";
  if (status === "rejected") return "거절";
  if (status === "cancelled") return "취소";
  return "대기중";
}

export function getProfileRequestStatusClass(status: ProfileRequestStatus) {
  if (status === "approved") return "bg-emerald-100 text-emerald-700";
  if (status === "rejected") return "bg-red-100 text-red-700";
  if (status === "cancelled") return "bg-gray-200 text-gray-700";
  return "bg-amber-100 text-amber-700";
}

export function formatProfileRequestDateTime(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("ko-KR");
}

export function getInfoEditTargetLabel(targetType: string) {
  if (targetType === "group") return "정보 수정 요청 (그룹)";
  if (targetType === "crew") return "정보 수정 요청 (소속)";
  if (targetType === "contents") return "정보 수정 요청 (콘텐츠)";
  return "정보 수정 요청 (버츄얼)";
}

export function getReportTargetLabel(request: MyEntityReportRequest) {
  if (request.target_type === "group") return "신고 요청 (그룹)";
  if (request.target_type === "crew") return "신고 요청 (소속)";
  if (request.target_type === "contents") return "신고 요청 (콘텐츠)";
  return "신고 요청 (버츄얼)";
}
