"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import Pagination from "@/components/common/pagination";
import ContentListItemCard from "@/components/screens/contents/content-list-item-card";
import ContentsScreenFilterPanel from "@/components/screens/contents/contents-screen-filter-panel";
import { useContentsFavorites } from "@/hooks/contents/use-contents-favorites";
import { useContentsScreenList } from "@/hooks/contents/use-contents-screen-list";
import { useAuthStore } from "@/store/useAuthStore";
import type { ContentsScreenProps } from "@/types/contents-screen";

/** 콘텐츠 목록 화면 */
export default function ContentsScreen({
  initialContents,
  initialFavoriteContentIds = [],
  hasContentsError = false,
  nowTimestamp,
}: ContentsScreenProps) {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuthStore();

  const baseFavoriteCountByContentId = useMemo(() => {
    return initialContents.reduce<Record<number, number>>((acc, content) => {
      acc[content.id] = content.favorite_count;
      return acc;
    }, {});
  }, [initialContents]);

  const {
    favoriteCountByContentId,
    likedContentIds,
    favoritePendingIds,
    onClickToggleFavorite,
  } = useContentsFavorites({
    baseFavoriteCountByContentId,
    initialFavoriteContentIds,
    userId: user?.id ?? null,
    isAuthLoading,
  });

  const {
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
    setPage,
    contents,
    filteredContents,
    paginatedContents,
    totalPages,
    safePage,
    onToggleContentType,
  } = useContentsScreenList({
    initialContents,
    nowTimestamp,
    favoriteCountByContentId,
  });

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
      <ContentsScreenFilterPanel
        searchKeyword={searchKeyword}
        onChangeSearchKeyword={(keyword) => {
          setSearchKeyword(keyword);
          setPage(1);
        }}
        canCreateContent={Boolean(user)}
        onClickCreateContent={() => router.push("/contents/write")}
        badgeFilter={badgeFilter}
        onChangeBadgeFilter={(filter) => {
          setBadgeFilter(filter);
          setPage(1);
        }}
        selectedContentTypes={selectedContentTypes}
        onResetContentTypeFilter={() => {
          setSelectedContentTypes([]);
          setPage(1);
        }}
        onToggleContentType={onToggleContentType}
        sortKey={sortKey}
        onClickSortButton={onClickSortButton}
        participantCompositionFilter={participantCompositionFilter}
        onChangeParticipantCompositionFilter={(filter) => {
          setParticipantCompositionFilter(filter);
          setPage(1);
        }}
        statusFilter={statusFilter}
        onChangeStatusFilter={(filter) => {
          setStatusFilter(filter);
          setPage(1);
        }}
        totalCount={filteredContents.length}
      />

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
              const favoriteCount = favoriteCountByContentId[content.id] ?? content.favorite_count;
              const isLiked = likedContentIds.has(content.id);
              const isFavoritePending = favoritePendingIds.has(content.id);
              const canToggleFavorite = Boolean(
                user && content.status !== "pending" && content.status !== "ended"
              );
              const isFavoriteDisabled = isFavoritePending || !canToggleFavorite;

              return (
                <div key={content.id}>
                  <ContentListItemCard
                    content={content}
                    favoriteCount={favoriteCount}
                    isLiked={isLiked}
                    isFavoriteDisabled={isFavoriteDisabled}
                    canToggleFavorite={canToggleFavorite}
                    nowTimestamp={nowTimestamp}
                    onClickToggleFavorite={onClickToggleFavorite}
                  />
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
