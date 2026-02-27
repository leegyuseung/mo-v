"use client";

import { Eye, Heart, Image as ImageIcon, Loader, Pause, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import Pagination from "@/components/common/pagination";
import { Input } from "@/components/ui/input";
import { CONTENT_TYPE_OPTIONS, CONTENT_TYPE_OPTIONS2 } from "@/types/content";
import type { Content } from "@/types/content";

type ContentsScreenProps = {
  initialContents: Content[];
  initialFavoriteContentIds?: number[];
  hasContentsError?: boolean;
  nowTimestamp: number;
};
type ContentSortKey = "created" | "view" | "heart" | "title" | "deadline";
type SortDirection = "asc" | "desc";
type ParticipantCompositionFilter = "all" | "버츄얼만" | "버츄얼포함";
type ContentStatusFilter = "all" | "approved" | "pending" | "ended";
type BadgeFilter = "all" | "new" | "closing";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const NEW_BADGE_WINDOW_IN_MS = 2 * DAY_IN_MS;
const ITEMS_PER_PAGE = 10;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function formatDateRange(start: string | null, end: string | null) {
  const startLabel = start ? formatDate(start) : "미입력";
  const endLabel = end ? formatDate(end) : "미입력";
  return `${startLabel} ~ ${endLabel}`;
}

function getStatusLabel(status: string) {
  if (status === "pending") return "대기중";
  if (status === "approved") return "모집중";
  if (status === "ended") return "마감";
  if (status === "rejected") return "거절";
  if (status === "cancelled") return "취소";
  if (status === "deleted") return "삭제";
  return status;
}

function getStatusClassName(status: string) {
  if (status === "pending") return "border-gray-200 bg-gray-100 text-gray-600";
  if (status === "approved") return "border-green-200 bg-green-50 text-green-700";
  if (status === "ended") return "border-amber-200 bg-amber-50 text-amber-700";
  if (status === "rejected") return "border-red-200 bg-red-50 text-red-700";
  if (status === "cancelled") return "border-gray-200 bg-gray-100 text-gray-600";
  if (status === "deleted") return "border-gray-200 bg-gray-100 text-gray-600";
  return "border-gray-200 bg-gray-100 text-gray-600";
}

function resolveDeadline(content: Content) {
  return content.recruitment_end_at || null;
}

function getDefaultSortDirection(sortKey: ContentSortKey): SortDirection {
  if (sortKey === "title" || sortKey === "deadline") return "asc";
  return "desc";
}

/** 콘텐츠 목록 화면 */
export default function ContentsScreen({
  initialContents,
  initialFavoriteContentIds = [],
  hasContentsError = false,
  nowTimestamp,
}: ContentsScreenProps) {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuthStore();
  const [searchKeyword, setSearchKeyword] = useState("");
  const [badgeFilter, setBadgeFilter] = useState<BadgeFilter>("all");
  const [sortKey, setSortKey] = useState<ContentSortKey>("created");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [participantCompositionFilter, setParticipantCompositionFilter] =
    useState<ParticipantCompositionFilter>("all");
  const [statusFilter, setStatusFilter] = useState<ContentStatusFilter>("approved");
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [favoriteCountByContentId, setFavoriteCountByContentId] = useState<Record<number, number>>(
    {}
  );
  const [likedContentIds, setLikedContentIds] = useState<Set<number>>(
    new Set(initialFavoriteContentIds)
  );
  const [favoritePendingIds, setFavoritePendingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    let isMounted = true;

    if (isAuthLoading) {
      return () => {
        isMounted = false;
      };
    }

    if (!user) {
      setLikedContentIds(new Set());
      return () => {
        isMounted = false;
      };
    }

    void fetch("/api/contents/favorites", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("좋아요 목록 조회 실패");
        }
        const body = (await response.json().catch(() => null)) as
          | { favoriteContentIds?: number[] }
          | null;
        if (!isMounted) return;

        const favoriteIds = Array.isArray(body?.favoriteContentIds)
          ? body.favoriteContentIds.filter((id) => Number.isFinite(id))
          : [];
        setLikedContentIds(new Set(favoriteIds));
      })
      .catch(() => {
        if (!isMounted) return;
        setLikedContentIds(new Set());
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, user]);
  const contents = useMemo(() => {
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

    return contents.filter((content) => {
      if (content.status === "rejected" || content.status === "cancelled" || content.status === "deleted") {
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
    }).sort((a, b) => {
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
    statusFilter,
    sortDirection,
    sortKey,
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

  const onClickToggleFavorite = async (
    event: React.MouseEvent<HTMLButtonElement>,
    contentId: number,
    contentStatus: string
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!user) {
      toast.error("로그인 후 좋아요가 가능합니다.");
      return;
    }
    if (contentStatus === "pending" || contentStatus === "ended") {
      return;
    }

    if (favoritePendingIds.has(contentId)) {
      return;
    }

    const baseFavoriteCount =
      favoriteCountByContentId[contentId] ??
      contents.find((content) => content.id === contentId)?.favorite_count ??
      0;
    const wasLiked = likedContentIds.has(contentId);
    const optimisticLiked = !wasLiked;
    const optimisticFavoriteCount = Math.max(
      0,
      baseFavoriteCount + (optimisticLiked ? 1 : -1)
    );

    // 낙관적 업데이트: 서버 응답 전 UI를 즉시 반영한다.
    setLikedContentIds((prev) => {
      const next = new Set(prev);
      if (optimisticLiked) {
        next.add(contentId);
      } else {
        next.delete(contentId);
      }
      return next;
    });
    setFavoriteCountByContentId((prev) => ({
      ...prev,
      [contentId]: optimisticFavoriteCount,
    }));

    setFavoritePendingIds((prev) => {
      const next = new Set(prev);
      next.add(contentId);
      return next;
    });

    try {
      const response = await fetch(`/api/contents/${contentId}/favorite`, {
        method: "POST",
      });

      const body = (await response.json().catch(() => null)) as
        | { liked?: boolean; favorite_count?: number; message?: string }
        | null;

      if (!response.ok) {
        throw new Error(body?.message || "좋아요 처리에 실패했습니다.");
      }

      const serverLiked = Boolean(body?.liked);
      const serverFavoriteCount =
        typeof body?.favorite_count === "number" ? body.favorite_count : undefined;

      // 서버 응답 기준으로 최종 동기화
      setLikedContentIds((prev) => {
        const next = new Set(prev);
        if (serverLiked) {
          next.add(contentId);
        } else {
          next.delete(contentId);
        }
        return next;
      });

      if (serverFavoriteCount !== undefined) {
        setFavoriteCountByContentId((prev) => ({
          ...prev,
          [contentId]: serverFavoriteCount,
        }));
      }
    } catch (error) {
      // 실패 시 낙관적 업데이트 롤백
      setLikedContentIds((prev) => {
        const next = new Set(prev);
        if (wasLiked) {
          next.add(contentId);
        } else {
          next.delete(contentId);
        }
        return next;
      });
      setFavoriteCountByContentId((prev) => ({
        ...prev,
        [contentId]: baseFavoriteCount,
      }));

      const message =
        error instanceof Error ? error.message : "좋아요 처리에 실패했습니다.";
      toast.error(message);
    } finally {
      setFavoritePendingIds((prev) => {
        const next = new Set(prev);
        next.delete(contentId);
        return next;
      });
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
      <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={searchKeyword}
              onChange={(event) => {
                setSearchKeyword(event.target.value);
                setPage(1);
              }}
              placeholder="제목, 콘텐츠 설명 검색"
              className="pl-9"
            />
          </div>
          <button
            type="button"
            onClick={() => router.push("/contents/write")}
            disabled={!user}
            className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer md:shrink-0"
          >
            콘텐츠 추가
          </button>
        </div>

        <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setBadgeFilter("all");
                setPage(1);
              }}
              className={`h-8 cursor-pointer rounded-md border px-3 text-xs font-medium transition-colors ${badgeFilter === "all"
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
            >
              전체
            </button>
            <button
              type="button"
              onClick={() => {
                setBadgeFilter("new");
                setPage(1);
              }}
              className={`h-8 cursor-pointer rounded-md border px-3 text-xs font-medium transition-colors ${badgeFilter === "new"
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
            >
              NEW
            </button>
            <button
              type="button"
              onClick={() => {
                setBadgeFilter("closing");
                setPage(1);
              }}
              className={`h-8 cursor-pointer rounded-md border px-3 text-xs font-medium transition-colors ${badgeFilter === "closing"
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
            >
              마감임박
            </button>
          </div>
          <div className="hidden flex-wrap gap-1.5 md:flex md:justify-end">
            <button
              type="button"
              onClick={() => {
                setSelectedContentTypes([]);
                setPage(1);
              }}
              className={`h-8 cursor-pointer rounded-md border px-3 text-xs font-medium transition-colors ${selectedContentTypes.length === 0
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
            >
              전체
            </button>
            {CONTENT_TYPE_OPTIONS.map((type) => (
              <button
                key={`content-type-filter-${type}`}
                type="button"
                onClick={() => onToggleContentType(type)}
                className={`h-8 cursor-pointer rounded-md border px-3 text-xs font-medium transition-colors ${selectedContentTypes.includes(type)
                  ? "border-gray-900 bg-gray-900 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* 2번째줄 */}
        <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2 md:flex-nowrap md:items-center md:gap-1.5 md:overflow-x-auto">
            <button
              type="button"
              onClick={() => onClickSortButton("created")}
              className={`h-8 shrink-0 cursor-pointer rounded-md border px-3 text-xs font-medium transition-colors ${sortKey === "created"
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
            >
              등록순
            </button>
            <button
              type="button"
              onClick={() => onClickSortButton("view")}
              className={`h-8 shrink-0 cursor-pointer rounded-md border px-3 text-xs font-medium transition-colors ${sortKey === "view"
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
            >
              조회순
            </button>
            <button
              type="button"
              onClick={() => onClickSortButton("heart")}
              className={`h-8 shrink-0 cursor-pointer rounded-md border px-3 text-xs font-medium transition-colors ${sortKey === "heart"
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
            >
              하트순
            </button>
            <button
              type="button"
              onClick={() => onClickSortButton("title")}
              className={`h-8 shrink-0 cursor-pointer rounded-md border px-3 text-xs font-medium transition-colors ${sortKey === "title"
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
            >
              제목순
            </button>
            <button
              type="button"
              onClick={() => onClickSortButton("deadline")}
              className={`h-8 shrink-0 cursor-pointer rounded-md border px-3 text-xs font-medium transition-colors ${sortKey === "deadline"
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
            >
              일정마감순
            </button>
            <select
              value={participantCompositionFilter}
              onChange={(event) => {
                setParticipantCompositionFilter(
                  event.target.value as ParticipantCompositionFilter
                );
                setPage(1);
              }
              }
              className="h-8 shrink-0 cursor-pointer rounded-md border border-gray-200 bg-white px-3 text-xs text-gray-700 outline-none focus:border-gray-300"
            >
              <option value="all">전체</option>
              <option value="버츄얼만">버츄얼만</option>
              <option value="버츄얼포함">버츄얼포함</option>
            </select>
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as ContentStatusFilter);
                setPage(1);
              }}
              className="h-8 shrink-0 cursor-pointer rounded-md border border-gray-200 bg-white px-3 text-xs text-gray-700 outline-none focus:border-gray-300"
            >
              <option value="all">전체</option>
              <option value="approved">모집중</option>
              <option value="pending">대기중</option>
              <option value="ended">마감</option>
            </select>
          </div>

          <div className="hidden md:ml-auto md:block md:min-w-0 md:flex-1">
            <div className="flex flex-wrap gap-1.5 md:justify-end">
              {CONTENT_TYPE_OPTIONS2.map((type) => (
                <button
                  key={`content-type-filter-${type}`}
                  type="button"
                  onClick={() => onToggleContentType(type)}
                  className={`h-8 cursor-pointer rounded-md border px-3 text-xs font-medium transition-colors ${selectedContentTypes.includes(type)
                    ? "border-gray-900 bg-gray-900 text-white"
                    : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-2 text-xs text-gray-500">총 {filteredContents.length.toLocaleString()}개 결과</p>
      </div>

      {hasContentsError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
          콘텐츠 목록을 불러오지 못했습니다.
        </div>
      ) : contents.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-6 text-sm text-gray-500">
          등록된 콘텐츠가 없습니다.
        </div>
      ) : filteredContents.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-6 text-sm text-gray-500">
          검색/필터 조건에 맞는 콘텐츠가 없습니다.
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {paginatedContents.map((content) => {
              const isPending = content.status === "pending";
              const isApproved = content.status === "approved";
              const visibleContentTypes = content.content_type.slice(0, 8);
              const hiddenContentTypeCount = Math.max(0, content.content_type.length - 8);
              const favoriteCount =
                favoriteCountByContentId[content.id] ?? content.favorite_count;
              const isLiked = likedContentIds.has(content.id);
              const isFavoritePending = favoritePendingIds.has(content.id);
              const canToggleFavorite = Boolean(
                user && content.status !== "pending" && content.status !== "ended"
              );
              const isFavoriteDisabled = isFavoritePending || !canToggleFavorite;

              const cardBody = (
                <article
                  className={`group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-gray-400 hover:bg-gray-50/40 hover:shadow-[0_14px_28px_-14px_rgba(0,0,0,0.45)] md:grid md:grid-cols-[72px_minmax(220px,1.2fr)_minmax(260px,1.1fr)_minmax(240px,1fr)_auto] md:items-center md:gap-4 ${isApproved ? "cursor-pointer" : ""}`}
                >
                  <div className="mb-3 flex items-start gap-3 md:mb-0 md:contents">
                    <div className="shrink-0 md:mb-0">
                      <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                        {content.image_url ? (
                          <img
                            src={content.image_url}
                            alt={`${content.title} 이미지`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-400">
                            <ImageIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1 md:mb-0">
                      <div className="mb-1 flex flex-wrap items-center gap-1.5">
                        {content.isNew ? (
                          <span className="rounded-full border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700">
                            NEW
                          </span>
                        ) : null}
                        {content.isClosingSoon ? (
                          <span className="rounded-full border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700">
                            마감임박
                          </span>
                        ) : null}
                        <span className="rounded-full border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-semibold text-gray-700">
                          {content.participant_composition}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold md:hidden ${getStatusClassName(
                            content.status
                          )}`}
                        >
                          {isPending ? <Pause className="h-3 w-3" /> : null}
                          {isApproved ? <Loader className="h-3 w-3 animate-spin" /> : null}
                          {getStatusLabel(content.status)}
                        </span>
                      </div>

                      <div className="space-y-0.5 text-[11px] text-gray-500 md:hidden">
                        <p>모집일정: {formatDateRange(content.recruitment_start_at, content.recruitment_end_at)}</p>
                        <p>콘텐츠일정: {formatDateRange(content.content_start_at, content.content_end_at)}</p>
                      </div>

                      <h2 className="mt-2 hidden truncate text-base font-semibold text-gray-900 transition-colors group-hover:text-black md:block">
                        {content.title}
                      </h2>
                    </div>
                  </div>

                  <h2 className="mb-3 truncate text-base font-semibold text-gray-900 transition-colors group-hover:text-black md:hidden">
                    {content.title}
                  </h2>

                  <p className="mb-3 line-clamp-2 min-h-10 text-sm text-gray-600 md:mb-0">
                    {content.description || "설명이 없습니다."}
                  </p>

                  <div className="mb-4 space-y-2 text-xs text-gray-500 md:mb-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {content.content_type.length > 0 ? (
                        <>
                          {visibleContentTypes.map((type) => (
                            <span
                              key={`${content.id}-${type}`}
                              className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700"
                            >
                              {type}
                            </span>
                          ))}
                          {hiddenContentTypeCount > 0 ? (
                            <span className="rounded-md border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                              +{hiddenContentTypeCount}
                            </span>
                          ) : null}
                        </>
                      ) : (
                        <span className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-500">
                          미지정
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-2 flex items-center justify-end gap-2 text-xs text-gray-900 md:hidden">
                    <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-gray-900">
                      <Eye className="h-3.5 w-3.5" />
                      {content.view_count.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={(event) => onClickToggleFavorite(event, content.id, content.status)}
                      disabled={isFavoriteDisabled}
                      className={`inline-flex items-center gap-1 rounded-full border bg-gray-50 px-2 py-0.5 transition-colors ${isLiked
                        ? "border-red-200 text-red-600"
                        : "border-gray-200 text-gray-500"
                        } ${canToggleFavorite ? "cursor-pointer hover:border-red-300 hover:text-red-600" : ""} ${isFavoriteDisabled ? "opacity-60" : ""
                        }`}
                    >
                      <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                      {favoriteCount.toLocaleString()}
                    </button>
                  </div>

                  <div className="hidden items-center justify-between gap-2 md:flex md:flex-col md:items-end md:justify-center">
                    <span
                      className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusClassName(
                        content.status
                      )}`}
                    >
                      {isPending ? <Pause className="h-3.5 w-3.5" /> : null}
                      {isApproved ? <Loader className="h-3.5 w-3.5 animate-spin" /> : null}
                      {getStatusLabel(content.status)}
                    </span>
                    <div className="space-y-0.5 text-right text-[11px] text-gray-500">
                      <p>모집일정: {formatDateRange(content.recruitment_start_at, content.recruitment_end_at)}</p>
                      <p>콘텐츠일정: {formatDateRange(content.content_start_at, content.content_end_at)}</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-end gap-2 text-xs text-gray-900">
                      <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-gray-900">
                        <Eye className="h-3.5 w-3.5" />
                        {content.view_count.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={(event) => onClickToggleFavorite(event, content.id, content.status)}
                        disabled={isFavoriteDisabled}
                        className={`inline-flex items-center gap-1 rounded-full border bg-gray-50 px-2 py-0.5 transition-colors ${isLiked
                          ? "border-red-200 text-red-600"
                          : "border-gray-200 text-gray-500"
                          } ${canToggleFavorite ? "cursor-pointer hover:border-red-300 hover:text-red-600" : ""} ${isFavoriteDisabled ? "opacity-60" : ""
                          }`}
                      >
                        <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
                        {favoriteCount.toLocaleString()}
                      </button>
                    </div>
                    {isPending ? <span className="h-7 md:hidden" /> : null}
                  </div>
                </article>
              );

              return (
                <div key={content.id}>
                  {isApproved ? (
                    <Link href={`/contents/${content.id}`} className="block">
                      {cardBody}
                    </Link>
                  ) : (
                    cardBody
                  )}
                </div>
              );
            })}
          </div>
          <Pagination page={safePage} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
