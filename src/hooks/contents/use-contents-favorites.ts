"use client";

import { useCallback, useEffect, useState, type MouseEvent } from "react";
import { toast } from "sonner";
import { fetchFavoriteContentIds, toggleContentFavorite } from "@/api/contents";
import type { ContentStatus } from "@/types/content";

type UseContentsFavoritesParams = {
  baseFavoriteCountByContentId: Record<number, number>;
  initialFavoriteContentIds: number[];
  userId: string | null;
  isAuthLoading: boolean;
};

export function useContentsFavorites({
  baseFavoriteCountByContentId,
  initialFavoriteContentIds,
  userId,
  isAuthLoading,
}: UseContentsFavoritesParams) {
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

    if (!userId) {
      setLikedContentIds(new Set());
      return () => {
        isMounted = false;
      };
    }

    // 로그인 사용자의 좋아요 목록을 선조회해 하트 깜빡임을 줄인다.
    void fetchFavoriteContentIds()
      .then((favoriteIds) => {
        if (!isMounted) return;
        setLikedContentIds(new Set(favoriteIds));
      })
      .catch(() => {
        if (!isMounted) return;
        setLikedContentIds(new Set());
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthLoading, userId]);

  const onClickToggleFavorite = useCallback(
    async (
      event: MouseEvent<HTMLButtonElement>,
      contentId: number,
      contentStatus: ContentStatus
    ) => {
      event.preventDefault();
      event.stopPropagation();

      if (!userId) {
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
        favoriteCountByContentId[contentId] ?? baseFavoriteCountByContentId[contentId] ?? 0;
      const wasLiked = likedContentIds.has(contentId);
      const optimisticLiked = !wasLiked;
      const optimisticFavoriteCount = Math.max(0, baseFavoriteCount + (optimisticLiked ? 1 : -1));

      // 서버 round-trip 전 사용자 체감 지연을 줄이기 위해 낙관적 업데이트를 적용한다.
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
        const body = await toggleContentFavorite(contentId);

        const serverLiked = Boolean(body?.liked);
        const serverFavoriteCount =
          typeof body?.favorite_count === "number" ? body.favorite_count : undefined;

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

        const message = error instanceof Error ? error.message : "좋아요 처리에 실패했습니다.";
        toast.error(message);
      } finally {
        setFavoritePendingIds((prev) => {
          const next = new Set(prev);
          next.delete(contentId);
          return next;
        });
      }
    },
    [baseFavoriteCountByContentId, favoriteCountByContentId, favoritePendingIds, likedContentIds, userId]
  );

  return {
    favoriteCountByContentId,
    likedContentIds,
    favoritePendingIds,
    onClickToggleFavorite,
  };
}
