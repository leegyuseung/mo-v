import type { MyEntityReportRequest } from "@/types/profile";

/** 요청 상태를 정규화된 RequestStatus 값으로 변환한다 */
export type RequestStatus = "pending" | "approved" | "rejected" | "cancelled";

export function normalizeStatus(status: string): RequestStatus {
  if (status === "approved") return "approved";
  if (status === "rejected") return "rejected";
  if (status === "cancelled") return "cancelled";
  return "pending";
}

/** 상태값에 대응하는 한국어 라벨을 반환한다 */
export function statusLabel(status: string) {
  const normalizedStatus = normalizeStatus(status);
  if (normalizedStatus === "approved") return "확인";
  if (normalizedStatus === "rejected") return "거절";
  if (normalizedStatus === "cancelled") return "취소";
  return "대기";
}

/** 상태값에 대응하는 Tailwind CSS 클래스를 반환한다 */
export function statusClass(status: string) {
  const normalizedStatus = normalizeStatus(status);
  if (normalizedStatus === "approved") return "bg-emerald-100 text-emerald-700";
  if (normalizedStatus === "rejected") return "bg-red-100 text-red-700";
  if (normalizedStatus === "cancelled") return "bg-gray-200 text-gray-700";
  return "bg-amber-100 text-amber-700";
}

/** 날짜 문자열을 한국어 로케일로 포매팅한다 */
export function formatDateTime(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("ko-KR");
}

/** 정보 수정 요청의 대상 라벨을 반환한다 (그룹/소속/버츄얼) */
export function getInfoEditTargetLabel(streamerNickname: string) {
  if (streamerNickname.startsWith("[GROUP]")) return "정보 수정 요청 (그룹)";
  if (streamerNickname.startsWith("[CREW]")) return "정보 수정 요청 (소속)";
  return "정보 수정 요청 (버츄얼)";
}

/** 신고 요청의 대상 라벨을 반환한다 (그룹/소속/버츄얼) */
export function getReportTargetLabel(request: MyEntityReportRequest) {
  if (request.target_type === "group") return "신고 요청 (그룹)";
  if (request.target_type === "crew") return "신고 요청 (소속)";
  return "신고 요청 (버츄얼)";
}
