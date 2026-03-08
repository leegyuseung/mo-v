export function getAdminContentStatusLabel(status: string) {
  if (status === "pending") return "대기중";
  if (status === "approved") return "진행중";
  if (status === "ended") return "마감";
  if (status === "rejected") return "거절";
  if (status === "cancelled") return "취소";
  if (status === "deleted") return "삭제";
  return status;
}

export function getAdminContentStatusClassName(status: string) {
  if (status === "pending") return "border-gray-200 bg-gray-100 text-gray-600";
  if (status === "approved") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "ended") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "rejected") return "border-red-200 bg-red-50 text-red-700";
  if (status === "cancelled") return "border-gray-200 bg-gray-100 text-gray-600";
  if (status === "deleted") return "border-gray-300 bg-gray-100 text-gray-700";
  return "border-gray-200 bg-gray-100 text-gray-600";
}

export function formatAdminContentDateLabel(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ko-KR");
}

export function formatAdminContentDateRangeLabel(start: string | null, end: string | null) {
  return `${formatAdminContentDateLabel(start)} ~ ${formatAdminContentDateLabel(end)}`;
}

export const getStatusLabel = getAdminContentStatusLabel;
export const getStatusClassName = getAdminContentStatusClassName;
export const formatDateLabel = formatAdminContentDateLabel;
export const formatDateRangeLabel = formatAdminContentDateRangeLabel;
