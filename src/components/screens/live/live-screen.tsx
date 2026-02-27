"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ExternalLink, Eye, Search, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import Pagination from "@/components/common/pagination";
import { useLiveStreamers } from "@/hooks/queries/live/use-live-streamers";
import { useStreamerGenres } from "@/hooks/queries/streamers/use-streamer-genres";
import { useIdolGroupCodeNames } from "@/hooks/queries/groups/use-idol-group-code-names";
import { useCrewCodeNames } from "@/hooks/queries/crews/use-crew-code-names";
import { useIsMobile } from "@/hooks/use-mobile";
import { useBrokenImages } from "@/hooks/use-broken-images";
import type { StreamerPlatform } from "@/types/streamer";
import type { LiveSortOrder } from "@/types/live";
import { STREAMER_PLATFORM_OPTIONS } from "@/lib/constant";
import { getPlatformActiveClass, getPlatformInactiveClass } from "@/utils/platform";
import StreamerGroupCrewBadges from "@/components/common/streamer-group-crew-badges";

export default function LiveScreen() {
  const isMobile = useIsMobile();
  const pageSize = isMobile ? 14 : 15;
  const [page, setPage] = useState(1);
  const [platform, setPlatform] = useState<StreamerPlatform>("all");
  const [genre, setGenre] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [sortOrder, setSortOrder] = useState<LiveSortOrder>("name_asc");
  /** 라이브 썸네일 이미지 깨짐 추적 (fallback → 프로필 이미지) */
  const brokenImages = useBrokenImages();
  const { data, isLoading, isError } = useLiveStreamers();
  const { data: genres = [] } = useStreamerGenres();
  const { data: idolGroups } = useIdolGroupCodeNames();
  const { data: crews } = useCrewCodeNames();

  /** 플랫폼·키워드·정렬 필터를 적용한 라이브 스트리머 목록 */
  const filteredLiveStreamers = useMemo(() => {
    const source = data || [];
    const keywordLower = keyword.trim().toLowerCase();

    return source
      .filter((item) => item.isLive)
      .filter((item) => {
        if (platform === "all") return true;
        return item.platform === platform;
      })
      .filter((item) => {
        if (genre === "all") return true;
        return (item.genre || []).includes(genre);
      })
      .filter((item) => {
        if (!keywordLower) return true;
        return (item.nickname || "").toLowerCase().includes(keywordLower);
      })
      .sort((a, b) => {
        if (sortOrder === "viewer_desc" || sortOrder === "viewer_asc") {
          const diff = (b.viewerCount ?? 0) - (a.viewerCount ?? 0);
          return sortOrder === "viewer_desc" ? diff : -diff;
        }
        const diff = (a.nickname || "").localeCompare(b.nickname || "", "ko");
        return sortOrder === "name_asc" ? diff : -diff;
      });
  }, [data, genre, keyword, platform, sortOrder]);

  const totalCount = filteredLiveStreamers.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = (page - 1) * pageSize;
  const to = from + pageSize;
  const pagedLiveStreamers = filteredLiveStreamers.slice(from, to);

  const isNameSort = sortOrder === "name_asc" || sortOrder === "name_desc";
  const isViewerSort = sortOrder === "viewer_desc" || sortOrder === "viewer_asc";

  /** 그룹 코드 → 이름 매핑 */
  const groupNameByCode = useMemo(() => {
    const map = new Map<string, string>();
    (idolGroups || []).forEach((group) => {
      map.set(group.group_code.trim().toLowerCase(), group.name);
    });
    return map;
  }, [idolGroups]);

  /** 소속 코드 → 이름 매핑 */
  const crewNameByCode = useMemo(() => {
    const map = new Map<string, string>();
    (crews || []).forEach((crew) => {
      map.set(crew.crew_code.trim().toLowerCase(), crew.name);
    });
    return map;
  }, [crews]);


  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* ─── 플랫폼·정렬·검색 필터 ─── */}
      <div className="mb-5 flex flex-col gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <span className="mr-1 self-center text-sm text-gray-500">구분</span>
            {STREAMER_PLATFORM_OPTIONS.map((item) => (
              <Button
                key={item.value}
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setPlatform(item.value);
                  setPage(1);
                }}
                className={`cursor-pointer ${platform === item.value
                  ? getPlatformActiveClass(item.value)
                  : getPlatformInactiveClass(item.value)
                  }`}
              >
                {item.label}
              </Button>
            ))}
          </div>

          <div className="flex w-full gap-2 md:w-auto">
            <div className="relative w-full md:w-80">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setPage(1);
                }}
                placeholder="버츄얼 명을 입력해 주세요"
                className="h-9 border-gray-200 bg-white pl-9"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="flex shrink-0 items-center gap-2">
            <span className="text-sm text-gray-500">정렬</span>
            <Button
              type="button"
              size="sm"
              variant="default"
              onClick={() =>
                setSortOrder((prev) => {
                  const next =
                    prev === "name_asc"
                      ? "name_desc"
                      : prev === "name_desc"
                        ? "name_asc"
                        : "name_asc";
                  setPage(1);
                  return next;
                })
              }
              className={`cursor-pointer ${isNameSort
                ? "bg-gray-800 hover:bg-gray-900 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
            >
              가나다순
            </Button>
            <Button
              type="button"
              size="sm"
              variant="default"
              onClick={() =>
                setSortOrder((prev) => {
                  const next =
                    prev === "viewer_desc"
                      ? "viewer_asc"
                      : prev === "viewer_asc"
                        ? "viewer_desc"
                        : "viewer_desc";
                  setPage(1);
                  return next;
                })
              }
              className={`cursor-pointer ${isViewerSort
                ? "bg-gray-800 hover:bg-gray-900 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
            >
              시청자 수
            </Button>
          </div>
          <select
            value={genre}
            onChange={(event) => {
              setGenre(event.target.value);
              setPage(1);
            }}
            className="ml-auto h-9 w-32 shrink-0 rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-gray-300 md:w-44"
          >
            <option value="all">전체</option>
            {genres.map((genreOption) => (
              <option key={`live-genre-${genreOption}`} value={genreOption}>
                {genreOption}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── 현재 라이브 수 ─── */}
      <div className="mb-4 text-sm text-gray-500">
        {isLoading
          ? "현재 라이브 데이터를 불러오는 중"
          : `현재 라이브 중 ${totalCount.toLocaleString()}명`}
      </div>

      {/* ─── 라이브 카드 그리드 ─── */}
      {isError ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-gray-400">
          라이브 데이터를 불러오지 못했습니다.
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {[...Array(pageSize)].map((_, index) => (
            <div
              key={`live-skeleton-${index}`}
              className="rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm"
            >
              <Skeleton className="mb-2 h-28 w-full rounded-lg" />
              <Skeleton className="mb-1 h-4 w-2/3" />
              <Skeleton className="mb-1 h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : totalCount === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-gray-400">
          현재 라이브중인 버츄얼이 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {pagedLiveStreamers.map((streamer, index) => {
            const liveThumbSrc = streamer.liveThumbnailImageUrl || "";
            const fallbackSrc = streamer.image_url || "";
            const hasLiveThumb = Boolean(liveThumbSrc);
            const useFallback = brokenImages.isBroken(streamer.id);
            const imageSrc = useFallback
              ? fallbackSrc
              : liveThumbSrc || fallbackSrc;
            const isLiveThumb = hasLiveThumb && !useFallback;

            return (
              <Link
                key={streamer.id}
                href={streamer.liveUrl}
                target="_blank"
                rel="noreferrer"
                className={`group rounded-xl border bg-white p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${streamer.platform === "chzzk"
                  ? "border-green-200"
                  : "border-blue-200"
                  }`}
              >
                {/* 썸네일: onError fallback이 필요하므로 <img> 유지 */}
                <div className="relative mb-2 h-28 overflow-hidden rounded-lg bg-gray-100">
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={streamer.nickname || "streamer"}
                      loading={index === 0 ? "eager" : "lazy"}
                      onError={() => {
                        if (hasLiveThumb && !useFallback && fallbackSrc) {
                          brokenImages.markBroken(streamer.id);
                        }
                      }}
                      className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <UserRound className="w-7 h-7 text-gray-300" />
                    </div>
                  )}

                  <span className="absolute top-2 left-2 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                    LIVE
                  </span>
                  {isLiveThumb ? (
                    <span className="absolute top-2 right-2 rounded-full bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white">
                      LIVE THUMB
                    </span>
                  ) : null}
                </div>

                <div className="mb-1 flex items-center justify-between gap-1">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {streamer.nickname || "이름 미등록"}
                  </p>
                  <span
                    className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${streamer.platform === "chzzk"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                      }`}
                  >
                    {streamer.platform?.toUpperCase() || "UNKNOWN"}
                  </span>
                </div>

                {streamer.liveTitle ? (
                  <p className="mb-1 truncate text-[11px] text-gray-500">
                    {streamer.liveTitle}
                  </p>
                ) : null}

                <div className="mb-1 flex items-center justify-between text-[11px] text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {(streamer.viewerCount ?? 0).toLocaleString()}명
                  </span>
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-gray-200 text-gray-500">
                    <ExternalLink className="w-3 h-3" />
                  </span>
                </div>

                <StreamerGroupCrewBadges
                  streamerId={streamer.id}
                  groupNames={streamer.group_name}
                  crewNames={streamer.crew_name}
                  groupNameByCode={groupNameByCode}
                  crewNameByCode={crewNameByCode}
                />
              </Link>
            );
          })}
        </div>
      )}

      {/* ─── 페이지네이션 (공통 컴포넌트) ─── */}
      {!isLoading && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
