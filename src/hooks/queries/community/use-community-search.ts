"use client";

import { useDeferredValue } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCommunitySearchResults } from "@/api/community";

/**
 * 통합 검색 입력값을 약간 늦춰 반영해 과도한 재요청을 줄인다.
 * 왜: community 검색은 입력 중 드롭다운이 열리는 형태라 타이핑마다 즉시 호출할 필요가 없다.
 */
export function useCommunitySearch(keyword: string) {
  const deferredKeyword = useDeferredValue(keyword);
  const trimmedKeyword = deferredKeyword.trim();

  return useQuery({
    queryKey: ["community-search", trimmedKeyword],
    queryFn: () => fetchCommunitySearchResults(trimmedKeyword),
    enabled: trimmedKeyword.length > 0,
    staleTime: 30 * 1000,
  });
}
