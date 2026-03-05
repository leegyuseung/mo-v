"use client";

import { useMemo, useState } from "react";
import {
  getDefaultSortDirection,
  ITEMS_PER_PAGE,
  NEW_BADGE_WINDOW_IN_MS,
  resolveDeadline,
} from "@/components/screens/contents/contents-screen-utils";
import { toSeoulDayIndex } from "@/utils/seoul-time";
import type {
  BadgeFilter,
  ContentSortKey,
  ContentStatusFilter,
  EnrichedContent,
  SortDirection,
} from "@/types/contents-screen";
import type { Content } from "@/types/content";

type UseContentsScreenListParams = {
  initialContents: Content[];
  nowTimestamp: number;
  favoriteCountByContentId: Record<number, number>;
};

function getSafeTime(value: string | null | undefined) {
  if (!value) return 0;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function getSafeNumber(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function useContentsScreenList({
  initialContents,
  nowTimestamp,
  favoriteCountByContentId,
}: UseContentsScreenListParams) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [badgeFilter, setBadgeFilter] = useState<BadgeFilter>("all");
  const [sortKey, setSortKey] = useState<ContentSortKey>("created");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [statusFilter, setStatusFilter] = useState<ContentStatusFilter>("approved");
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const contents = useMemo<EnrichedContent[]>(() => {
    const now = nowTimestamp;
    const todayDayIndex = toSeoulDayIndex(now);

    return [...initialContents]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((content) => {
        const createdAt = new Date(content.created_at).getTime();
        const deadlineValue = resolveDeadline(content);
        const deadlineDayIndex = deadlineValue ? toSeoulDayIndex(deadlineValue) : null;

        const isNew = Number.isFinite(createdAt) && now - createdAt <= NEW_BADGE_WINDOW_IN_MS;
        const dayDiff =
          deadlineDayIndex !== null && todayDayIndex !== null
            ? deadlineDayIndex - todayDayIndex
            : null;
        const isClosingSoon = dayDiff !== null && dayDiff >= 0 && dayDiff <= 3;

        return {
          ...content,
          isNew,
          isClosingSoon,
        };
      });
  }, [initialContents, nowTimestamp]);

  const filteredContents = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    const todayDayIndex = toSeoulDayIndex(nowTimestamp);

    const getApprovedRecruitmentRank = (content: Content) => {
      if (content.status !== "approved" || !content.recruitment_start_at) {
        return 0;
      }

      const recruitmentStartDayIndex = toSeoulDayIndex(content.recruitment_start_at);
      if (todayDayIndex === null || recruitmentStartDayIndex === null) return 0;
      return todayDayIndex < recruitmentStartDayIndex ? 1 : 0;
    };

    return contents
      .filter((content) => {
        if (
          content.status === "rejected" ||
          content.status === "cancelled" ||
          content.status === "deleted"
        ) {
          return false;
        }

        if (statusFilter !== "all" && content.status !== statusFilter) {
          return false;
        }

        if (keyword) {
          const isTitleMatched = content.title.toLowerCase().includes(keyword);
          const isDescriptionMatched = (content.description || "").toLowerCase().includes(keyword);
          if (!isTitleMatched && !isDescriptionMatched) return false;
        }

        if (
          selectedContentTypes.length > 0 &&
          !content.content_type.some((type) => selectedContentTypes.includes(type))
        ) {
          return false;
        }

        if (badgeFilter === "new" && !content.isNew) return false;
        if (badgeFilter === "closing" && !content.isClosingSoon) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortKey === "created") {
          const approvedRecruitmentRankDiff =
            getApprovedRecruitmentRank(a) - getApprovedRecruitmentRank(b);
          if (approvedRecruitmentRankDiff !== 0) {
            return approvedRecruitmentRankDiff;
          }
        }

        if (sortKey === "view") {
          const diff = getSafeNumber(a.view_count) - getSafeNumber(b.view_count);
          if (diff !== 0) return sortDirection === "asc" ? diff : -diff;
          return getSafeTime(b.created_at) - getSafeTime(a.created_at);
        }

        if (sortKey === "heart") {
          const aFavoriteCount = getSafeNumber(favoriteCountByContentId[a.id] ?? a.favorite_count);
          const bFavoriteCount = getSafeNumber(favoriteCountByContentId[b.id] ?? b.favorite_count);
          const diff = aFavoriteCount - bFavoriteCount;
          if (diff !== 0) return sortDirection === "asc" ? diff : -diff;
          return getSafeTime(b.created_at) - getSafeTime(a.created_at);
        }

        if (sortKey === "deadline") {
          const aDeadlineValue = resolveDeadline(a);
          const bDeadlineValue = resolveDeadline(b);
          if (!aDeadlineValue && !bDeadlineValue) {
            return getSafeTime(b.created_at) - getSafeTime(a.created_at);
          }
          if (!aDeadlineValue) return 1;
          if (!bDeadlineValue) return -1;

          const diff = getSafeTime(aDeadlineValue) - getSafeTime(bDeadlineValue);
          if (diff !== 0) return sortDirection === "asc" ? diff : -diff;
          return getSafeTime(b.created_at) - getSafeTime(a.created_at);
        }

        const diff = getSafeTime(a.created_at) - getSafeTime(b.created_at);
        if (diff !== 0) return sortDirection === "asc" ? diff : -diff;
        return a.title.localeCompare(b.title, "ko");
      });
  }, [
    badgeFilter,
    contents,
    favoriteCountByContentId,
    searchKeyword,
    selectedContentTypes,
    sortDirection,
    sortKey,
    statusFilter,
    nowTimestamp,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredContents.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedContents = useMemo(() => {
    return filteredContents.slice(0, safePage * ITEMS_PER_PAGE);
  }, [filteredContents, safePage]);

  const onToggleContentType = (type: string) => {
    setPage(1);
    setSelectedContentTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((item) => item !== type);
      }
      return [...prev, type];
    });
  };

  const onClickSortButton = (nextSortKey: ContentSortKey) => {
    setPage(1);

    if (sortKey === nextSortKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextSortKey);
    setSortDirection(getDefaultSortDirection(nextSortKey));
  };

  return {
    searchKeyword,
    setSearchKeyword,
    badgeFilter,
    setBadgeFilter,
    sortKey,
    onClickSortButton,
    statusFilter,
    setStatusFilter,
    selectedContentTypes,
    setSelectedContentTypes,
    page,
    setPage,
    contents,
    filteredContents,
    paginatedContents,
    totalPages,
    safePage,
    onToggleContentType,
  };
}
