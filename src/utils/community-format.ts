import type { CommunityCategory } from "@/types/community";
import {
  formatNoticeDateTime,
  formatNoticeListDate,
  formatNoticeViewCount,
  getNoticeDescription,
} from "@/utils/notice-format";

export function getCommunityCategoryLabel(category: CommunityCategory) {
  switch (category) {
    case "notice":
      return "공지";
    case "info_schedule":
      return "정보/일정";
    case "broadcast_review":
      return "방송후기";
    case "broadcast_summary":
      return "방송정리";
    default:
      return "일반";
  }
}

export function getCommunityCategoryBadgeClassName(category: CommunityCategory) {
  switch (category) {
    case "notice":
      return "bg-blue-50 text-blue-700";
    case "info_schedule":
      return "bg-emerald-50 text-emerald-700";
    case "broadcast_review":
      return "bg-violet-50 text-violet-700";
    case "broadcast_summary":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export function formatCommunityListDate(value: string | null) {
  return formatNoticeListDate(value);
}

export function formatCommunityDateTime(value: string | null) {
  return formatNoticeDateTime(value);
}

export function formatCommunityViewCount(value: number) {
  return formatNoticeViewCount(value);
}

export function getCommunityDescription(html: string, maxLength?: number) {
  return getNoticeDescription(html, maxLength);
}
