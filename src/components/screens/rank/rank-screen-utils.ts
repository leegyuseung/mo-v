import type { HeartRankPeriod, StreamerHeartLeaderboardItem } from "@/types/heart";
import type { RankFilterOption } from "@/types/rank-screen";

export const RANK_FILTERS: RankFilterOption[] = [
  { key: "all", label: "전체" },
  { key: "yearly", label: "연간" },
  { key: "monthly", label: "월간" },
  { key: "weekly", label: "주간" },
];

export const RANK_PAGE_SIZE = 20;
export const RANK_FETCH_LIMIT = 1000;

export function toHeartRankPeriod(value: string | null): HeartRankPeriod {
  if (value === "yearly" || value === "monthly" || value === "weekly" || value === "all") {
    return value;
  }
  return "all";
}

export function getPeriodTitle(period: HeartRankPeriod): string {
  if (period === "yearly") return "연간";
  if (period === "monthly") return "월간";
  if (period === "weekly") return "주간";
  return "전체";
}

/**
 * 검색 키워드가 닉네임/그룹/크루에 매칭되는지 확인한다.
 * 왜: rank-screen와 하위 컴포넌트에서 동일 조건을 공유해 검색 일관성을 유지하기 위함.
 */
export function isMatchedRankKeyword(
  item: StreamerHeartLeaderboardItem,
  keyword: string,
  groupNameByCode: Map<string, string>,
  crewNameByCode: Map<string, string>
): boolean {
  const trimmed = keyword.trim().toLowerCase();
  if (!trimmed) return true;

  const nicknameMatched = (item.nickname || "").toLowerCase().includes(trimmed);
  if (nicknameMatched) return true;

  const groupMatched = (item.group_name || []).some((group) => {
    const raw = group.toLowerCase();
    const mapped = (groupNameByCode.get(group.trim().toLowerCase()) || "").toLowerCase();
    return raw.includes(trimmed) || mapped.includes(trimmed);
  });
  if (groupMatched) return true;

  const crewMatched = (item.crew_name || []).some((crew) => {
    const raw = crew.toLowerCase();
    const mapped = (crewNameByCode.get(crew.trim().toLowerCase()) || "").toLowerCase();
    return raw.includes(trimmed) || mapped.includes(trimmed);
  });
  return crewMatched;
}
