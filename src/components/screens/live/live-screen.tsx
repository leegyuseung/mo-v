"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Pagination from "@/components/common/pagination";
import SearchInput from "@/components/common/search-input";
import LiveStreamerCard from "@/components/screens/live/live-streamer-card";
import { useLiveStreamers } from "@/hooks/queries/live/use-live-streamers";
import { useStreamerGenres } from "@/hooks/queries/streamers/use-streamer-genres";
import { useIdolGroupCodeNames } from "@/hooks/queries/groups/use-idol-group-code-names";
import { useCrewCodeNames } from "@/hooks/queries/crews/use-crew-code-names";
import { useIsMobile } from "@/hooks/use-mobile";
import { useBrokenImages } from "@/hooks/use-broken-images";
import type { StreamerPlatform } from "@/types/streamer";
import type { LiveSortOrder } from "@/types/live";

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
  const { data, isLoading, isError } = useLiveStreamers(true, true);
  const { data: genres = [] } = useStreamerGenres();
  const { data: idolGroups } = useIdolGroupCodeNames();
  const { data: crews } = useCrewCodeNames();

  /** 플랫폼·키워드·정렬 필터를 적용한 라이브 스트리머 목록 */
  const filteredLiveStreamers = useMemo(() => {
    const source = data || [];
    const keywordLower = keyword.trim().toLowerCase();

    return source
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
          <div className="flex flex-wrap items-center gap-2 md:flex-nowrap md:overflow-x-auto">
            <span className="mr-1 inline-flex h-9 items-center text-sm text-gray-500">구분</span>
            <select
              value={platform}
              onChange={(event) => {
                setPlatform(event.target.value as StreamerPlatform);
                setPage(1);
              }}
              className="h-9 w-28 shrink-0 cursor-pointer rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-gray-300"
            >
              <option value="all">전체</option>
              <option value="soop">SOOP</option>
              <option value="chzzk">CHZZK</option>
            </select>
            <span className="ml-2 inline-flex h-9 items-center text-sm text-gray-500">장르</span>
            <select
              value={genre}
              onChange={(event) => {
                setGenre(event.target.value);
                setPage(1);
              }}
              className="h-9 w-32 shrink-0 cursor-pointer rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-gray-300 md:w-44"
            >
              <option value="all">전체</option>
              {genres.map((genreOption) => (
                <option key={`live-genre-${genreOption}`} value={genreOption}>
                  {genreOption}
                </option>
              ))}
            </select>
            <span className="inline-flex h-9 items-center text-sm text-gray-500">정렬</span>
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
              className={`h-9 shrink-0 cursor-pointer ${isNameSort
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
              className={`h-9 shrink-0 cursor-pointer ${isViewerSort
                ? "bg-gray-800 hover:bg-gray-900 text-white"
                : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
            >
              시청자 수
            </Button>
          </div>

          <div className="flex w-full gap-2 md:w-auto">
            <SearchInput
              value={keyword}
              onChange={(value) => {
                setKeyword(value);
                setPage(1);
              }}
              placeholder="버츄얼 명을 입력해 주세요"
              containerClassName="w-full md:w-80"
              inputClassName="h-9 border-gray-200 bg-white"
            />
          </div>
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
          {pagedLiveStreamers.map((streamer, index) => (
            <LiveStreamerCard
              key={streamer.id}
              streamer={streamer}
              eager={index === 0}
              isBroken={brokenImages.isBroken}
              markBroken={brokenImages.markBroken}
              groupNameByCode={groupNameByCode}
              crewNameByCode={crewNameByCode}
            />
          ))}
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
