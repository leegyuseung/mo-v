"use client";

import { useMemo, useState } from "react";
import {
  DAY_IN_MS,
  getDefaultSortDirection,
  ITEMS_PER_PAGE,
  NEW_BADGE_WINDOW_IN_MS,
  resolveDeadline,
} from "@/components/screens/contents/contents-screen-utils";
import type {
  BadgeFilter,
  ContentSortKey,
  ContentStatusFilter,
  EnrichedContent,
  ParticipantCompositionFilter,
  SortDirection,
} from "@/types/contents-screen";
import type { Content } from "@/types/content";

type UseContentsScreenListParams = {
  initialContents: Content[];
  nowTimestamp: number;
  favoriteCountByContentId: Record<number, number>;
};

export function useContentsScreenList({
  initialContents,
  nowTimestamp,
  favoriteCountByContentId,
}: UseContentsScreenListParams) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [badgeFilter, setBadgeFilter] = useState<BadgeFilter>("all");
  const [sortKey, setSortKey] = useState<ContentSortKey>("created");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [participantCompositionFilter, setParticipantCompositionFilter] =
    useState<ParticipantCompositionFilter>("all");
  const [statusFilter, setStatusFilter] = useState<ContentStatusFilter>("approved");
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const contents = useMemo<EnrichedContent[]>(() => {
    const now = nowTimestamp;
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);

    return [...initialContents]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .map((content) => {
        const createdAt = new Date(content.created_at).getTime();
        const deadlineValue = resolveDeadline(content);
        const deadlineDate = deadlineValue ? new Date(deadlineValue) : null;
        if (deadlineDate) deadlineDate.setHours(0, 0, 0, 0);
        const deadlineAt = deadlineDate ? deadlineDate.getTime() : null;

        const isNew = Number.isFinite(createdAt) && now - createdAt <= NEW_BADGE_WINDOW_IN_MS;
        const dayDiff =
          deadlineAt && Number.isFinite(deadlineAt)
            ? Math.floor((deadlineAt - todayStart.getTime()) / DAY_IN_MS)
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

        if (
          participantCompositionFilter !== "all" &&
          content.participant_composition !== participantCompositionFilter
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortKey === "title") {
          const diff = a.title.localeCompare(b.title, "ko");
          if (diff !== 0) return sortDirection === "asc" ? diff : -diff;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }

        if (sortKey === "view") {
          const diff = a.view_count - b.view_count;
          if (diff !== 0) return sortDirection === "asc" ? diff : -diff;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }

        if (sortKey === "heart") {
          const aFavoriteCount = favoriteCountByContentId[a.id] ?? a.favorite_count;
          const bFavoriteCount = favoriteCountByContentId[b.id] ?? b.favorite_count;
          const diff = aFavoriteCount - bFavoriteCount;
          if (diff !== 0) return sortDirection === "asc" ? diff : -diff;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }

        if (sortKey === "deadline") {
          const aDeadlineValue = resolveDeadline(a);
          const bDeadlineValue = resolveDeadline(b);
          if (!aDeadlineValue && !bDeadlineValue) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          if (!aDeadlineValue) return 1;
          if (!bDeadlineValue) return -1;

          const diff = new Date(aDeadlineValue).getTime() - new Date(bDeadlineValue).getTime();
          if (diff !== 0) return sortDirection === "asc" ? diff : -diff;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }

        const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (diff !== 0) return sortDirection === "asc" ? diff : -diff;
        return a.title.localeCompare(b.title, "ko");
      });
  }, [
    badgeFilter,
    contents,
    favoriteCountByContentId,
    participantCompositionFilter,
    searchKeyword,
    selectedContentTypes,
    sortDirection,
    sortKey,
    statusFilter,
  ]);

  const totalPages = Math.max(1, Math.ceil(filteredContents.length / ITEMS_PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const paginatedContents = useMemo(() => {
    const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredContents.slice(startIndex, startIndex + ITEMS_PER_PAGE);
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
    participantCompositionFilter,
    setParticipantCompositionFilter,
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
