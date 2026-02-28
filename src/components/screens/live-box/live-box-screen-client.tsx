"use client";

import { useCallback, useMemo, useState } from "react";
import LiveBoxFilterControls from "@/components/screens/live-box/live-box-filter-controls";
import LiveBoxListCard from "@/components/screens/live-box/live-box-list-card";
import { Spinner } from "@/components/ui/spinner";
import { useInfiniteScrollTrigger } from "@/hooks/use-infinite-scroll-trigger";
import { useAuthStore } from "@/store/useAuthStore";
import { getLiveBoxDefaultSortDirection } from "@/utils/live-box-presenter";
import type {
  LiveBoxScreenProps,
  LiveBoxSortDirection,
  LiveBoxSortKey,
  LiveBoxStatusFilter,
  LiveBoxParticipantPreviewByPlatformId,
} from "@/types/live-box-screen";

const PAGE_SIZE = 9;

/** 라이브박스 목록 클라이언트 화면 (검색 + 필터/정렬 + 페이지네이션) */
export default function LiveBoxScreenClient({
  initialLiveBoxes,
  initialParticipantProfiles,
  hasLiveBoxesError = false,
  hasParticipantProfilesError = false,
}: LiveBoxScreenProps) {
  const { user } = useAuthStore();
  const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<LiveBoxStatusFilter>("ongoing");
  const [sortKey, setSortKey] = useState<LiveBoxSortKey>("created");
  const [sortDirection, setSortDirection] = useState<LiveBoxSortDirection>("desc");
  const [brokenParticipantImageById, setBrokenParticipantImageById] = useState<
    Record<string, boolean>
  >({});

  const participantByPlatformId = useMemo<LiveBoxParticipantPreviewByPlatformId>(() => {
    const map = new Map();

    initialParticipantProfiles.forEach((profile) => {
      if (profile.chzzk_id) {
        map.set(profile.chzzk_id, {
          platformId: profile.chzzk_id,
          nickname: profile.nickname,
          imageUrl: profile.image_url,
        });
      }

      if (profile.soop_id) {
        map.set(profile.soop_id, {
          platformId: profile.soop_id,
          nickname: profile.nickname,
          imageUrl: profile.image_url,
        });
      }
    });

    return map;
  }, [initialParticipantProfiles]);

  const filteredLiveBoxes = useMemo(() => {
    const trimmedKeyword = keyword.trim().toLowerCase();

    return initialLiveBoxes
      .filter((box) => {
        if (!trimmedKeyword) return true;

        const matchTitle = box.title.toLowerCase().includes(trimmedKeyword);
        const matchCategory = box.category.some((item) =>
          item.toLowerCase().includes(trimmedKeyword)
        );
        const matchParticipant = box.participant_streamer_ids.some((platformId) => {
          const participant = participantByPlatformId.get(platformId);
          const nickname = (participant?.nickname || "").toLowerCase();
          return platformId.toLowerCase().includes(trimmedKeyword) || nickname.includes(trimmedKeyword);
        });

        return matchTitle || matchCategory || matchParticipant;
      })
      .filter((box) => {
        if (statusFilter === "all") return true;
        if (statusFilter === "ongoing") return box.status === "진행중";
        if (statusFilter === "pending") return box.status === "대기";
        return box.status === "종료";
      })
      .sort((a, b) => {
        if (sortKey === "title") {
          const diff = a.title.localeCompare(b.title, "ko");
          return sortDirection === "asc" ? diff : -diff;
        }

        if (sortKey === "participants") {
          const diff = a.participant_streamer_ids.length - b.participant_streamer_ids.length;
          if (diff !== 0) {
            return sortDirection === "asc" ? diff : -diff;
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }

        const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        return sortDirection === "asc" ? diff : -diff;
      });
  }, [initialLiveBoxes, keyword, participantByPlatformId, sortDirection, sortKey, statusFilter]);

  const totalCount = filteredLiveBoxes.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleLiveBoxes = filteredLiveBoxes.slice(0, currentPage * PAGE_SIZE);
  const hasMore = currentPage < totalPages;

  const onParticipantImageError = useCallback((platformId: string) => {
    setBrokenParticipantImageById((prev) => {
      if (prev[platformId]) return prev;
      return { ...prev, [platformId]: true };
    });
  }, []);

  const onKeywordChange = useCallback((value: string) => {
    setKeyword(value);
    setPage(1);
  }, []);

  const onSelectStatusFilter = useCallback((nextFilter: LiveBoxStatusFilter) => {
    setStatusFilter(nextFilter);
    setPage(1);
  }, []);

  const onClickSortButton = useCallback(
    (nextSortKey: LiveBoxSortKey) => {
      setPage(1);
      if (sortKey === nextSortKey) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        return;
      }

      setSortKey(nextSortKey);
      setSortDirection(getLiveBoxDefaultSortDirection(nextSortKey));
    },
    [sortKey]
  );

  const onLoadMore = useCallback(() => {
    if (!hasMore) return;
    setPage((prev) => Math.min(prev + 1, totalPages));
  }, [hasMore, totalPages]);

  const sentinelRef = useInfiniteScrollTrigger({
    enabled: !hasLiveBoxesError,
    hasMore,
    isLoading: false,
    onLoadMore,
  });

  return (
    <div className="mx-auto max-w-7xl p-4 md:p-6">
      <LiveBoxFilterControls
        keyword={keyword}
        totalCount={totalCount}
        statusFilter={statusFilter}
        sortKey={sortKey}
        hasUser={Boolean(user)}
        onKeywordChange={onKeywordChange}
        onSelectStatusFilter={onSelectStatusFilter}
        onClickSortButton={onClickSortButton}
      />

      {hasLiveBoxesError ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          라이브박스 목록을 불러오지 못했습니다.
        </div>
      ) : filteredLiveBoxes.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          검색 조건에 맞는 라이브박스가 없습니다.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleLiveBoxes.map((box) => (
              <LiveBoxListCard
                key={box.id}
                box={box}
                participantByPlatformId={participantByPlatformId}
                brokenParticipantImageById={brokenParticipantImageById}
                onParticipantImageError={onParticipantImageError}
              />
            ))}
          </div>

          {hasMore ? (
            <div ref={sentinelRef} className="mt-4 flex h-10 items-center justify-center">
              <Spinner className="h-5 w-5 border-2" />
            </div>
          ) : null}
        </>
      )}

      {hasParticipantProfilesError && !hasLiveBoxesError ? (
        <p className="mt-3 text-xs text-amber-700">
          참여자 프로필 일부를 불러오지 못해 기본 아이콘으로 표시됩니다.
        </p>
      ) : null}
    </div>
  );
}
