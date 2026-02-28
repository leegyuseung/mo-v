"use client";

import { useEffect, useRef } from "react";

type UseInfiniteScrollTriggerParams = {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  enabled?: boolean;
  rootMargin?: string;
};

/**
 * 무한 스크롤 sentinel이 뷰포트에 들어오면 다음 목록을 로드한다.
 * 왜: 페이지네이션 버튼 없이 동일한 UX를 여러 화면에서 재사용하기 위함.
 */
export function useInfiniteScrollTrigger({
  hasMore,
  isLoading,
  onLoadMore,
  enabled = true,
  rootMargin = "240px",
}: UseInfiniteScrollTriggerParams) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!enabled || !hasMore) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || isLoading) return;
        onLoadMore();
      },
      { root: null, rootMargin, threshold: 0 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, hasMore, isLoading, onLoadMore, rootMargin]);

  return sentinelRef;
}

