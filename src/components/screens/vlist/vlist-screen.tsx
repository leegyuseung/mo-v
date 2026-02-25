"use client";

import Image from "next/image";
import Pagination from "@/components/common/pagination";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useStreamers } from "@/hooks/queries/streamers/use-streamers";
import { useStreamerGenres } from "@/hooks/queries/streamers/use-streamer-genres";
import { useIdolGroupCodeNames } from "@/hooks/queries/groups/use-idol-group-code-names";
import { useCrewCodeNames } from "@/hooks/queries/crews/use-crew-code-names";
import type {
  StreamerPlatform,
  StreamerSortBy,
  StreamerSortOrder,
} from "@/types/streamer";
import { Star, UserRound } from "lucide-react";
import {
  STREAMER_PAGE_SIZE,
  STREAMER_PLATFORM_OPTIONS,
} from "@/lib/constant";
import StreamerRequestTriggerButton from "@/components/common/streamer-request-trigger-button";
import { useAuthStore } from "@/store/useAuthStore";
import { useIsMobile } from "@/hooks/use-mobile";
import { useStarredStreamerIds } from "@/hooks/queries/star/use-starred-streamer-ids";
import { getPlatformActiveClass, getPlatformInactiveClass } from "@/utils/platform";
import PlatformBadge from "@/components/common/platform-badge";
import StreamerCardSkeleton from "@/components/common/streamer-card-skeleton";
import { generateArray } from "@/utils/array";

export default function VlistScreen() {
  const [page, setPage] = useState(1);
  const [platform, setPlatform] = useState<StreamerPlatform>("all");
  const [genre, setGenre] = useState("all");
  const [sortBy, setSortBy] = useState<StreamerSortBy>("name");
  const [sortOrder, setSortOrder] = useState<StreamerSortOrder>("asc");
  const [keyword, setKeyword] = useState("");
  const { user } = useAuthStore();
  const isMobile = useIsMobile();
  const pageSize = isMobile ? 14 : STREAMER_PAGE_SIZE;

  const { data, isLoading, isFetching } = useStreamers({
    page,
    pageSize,
    platform,
    genre,
    sortBy,
    sortOrder,
    keyword,
  });
  const { data: genres = [] } = useStreamerGenres();
  const { data: idolGroups } = useIdolGroupCodeNames();
  const { data: crews } = useCrewCodeNames();
  const { data: starredStreamerIdList = [] } = useStarredStreamerIds(user?.id);
  const starredStreamerIds = useMemo(
    () => new Set(starredStreamerIdList),
    [starredStreamerIdList]
  );

  const streamers = data?.data || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const groupNameByCode = useMemo(() => {
    const map = new Map<string, string>();
    (idolGroups || []).forEach((group) => {
      map.set(group.group_code.trim().toLowerCase(), group.name);
    });
    return map;
  }, [idolGroups]);


  const crewNameByCode = useMemo(() => {
    const map = new Map<string, string>();
    (crews || []).forEach((crew) => {
      map.set(crew.crew_code.trim().toLowerCase(), crew.name);
    });
    return map;
  }, [crews]);

  const onChangePlatform = (next: StreamerPlatform) => {
    setPlatform(next);
    setPage(1);
  };

  const onChangeGenre = (nextGenre: string) => {
    setGenre(nextGenre);
    setPage(1);
  };

  const onChangeSort = (nextSortBy: StreamerSortBy) => {
    if (sortBy === nextSortBy) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(nextSortBy);
      setSortOrder(nextSortBy === "heart" || nextSortBy === "star" ? "desc" : "asc");
    }
    setPage(1);
  };

  const onChangeKeyword = (value: string) => {
    setKeyword(value);
    setPage(1);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
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
                onClick={() => onChangePlatform(item.value)}
                className={`cursor-pointer ${platform === item.value
                  ? getPlatformActiveClass(item.value)
                  : getPlatformInactiveClass(item.value)
                  }`}
              >
                {item.label}
              </Button>
            ))}
            <select
              value={genre}
              onChange={(event) => onChangeGenre(event.target.value)}
              className="h-8 rounded-md border border-gray-200 bg-white px-2.5 text-xs text-gray-700 outline-none focus:border-gray-300"
            >
              <option value="all">장르 전체</option>
              {genres.map((genreOption) => (
                <option key={`vlist-genre-${genreOption}`} value={genreOption}>
                  {genreOption}
                </option>
              ))}
            </select>
          </div>

          <div className="flex w-full gap-2 md:w-auto">
            <Input
              value={keyword}
              onChange={(e) => onChangeKeyword(e.target.value)}
              placeholder="버츄얼 명을 입력해 주세요"
              className="h-9 border-gray-200 bg-white md:w-80"
            />
            <StreamerRequestTriggerButton
              className="h-9 cursor-pointer whitespace-nowrap border-gray-200 text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">정렬</span>
          <Button
            type="button"
            size="sm"
            variant={sortBy === "name" ? "default" : "outline"}
            onClick={() => onChangeSort("name")}
            className={`cursor-pointer ${sortBy === "name" ? "bg-gray-800 hover:bg-gray-900 text-white" : ""}`}
          >
            가나다순
          </Button>
          <Button
            type="button"
            size="sm"
            variant={sortBy === "heart" ? "default" : "outline"}
            onClick={() => onChangeSort("heart")}
            className={`cursor-pointer ${sortBy === "heart" ? "bg-gray-800 hover:bg-gray-900 text-white" : ""}`}
          >
            하트순
          </Button>
          <Button
            type="button"
            size="sm"
            variant={sortBy === "star" ? "default" : "outline"}
            onClick={() => onChangeSort("star")}
            className={`cursor-pointer ${sortBy === "star" ? "bg-gray-800 hover:bg-gray-900 text-white" : ""}`}
          >
            즐겨찾기순
          </Button>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-500">
        {isLoading ? "로딩중..." : `총 ${totalCount.toLocaleString()}명의 버츄얼`}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {generateArray(pageSize).map((_, index) => (
            <StreamerCardSkeleton key={`vlist-skeleton-${index}`} />
          ))}
        </div>
      ) : streamers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-gray-400">
          버츄얼 정보가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {streamers.map((streamer, index) => (
            <Link
              key={streamer.id}
              href={`/vlist/${streamer.public_id ?? streamer.id}`}
              className="group rounded-xl border border-gray-200 bg-white p-2.5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-gray-400 hover:bg-gray-50/40 hover:shadow-[0_14px_28px_-14px_rgba(0,0,0,0.45)]"
            >
              <div className="relative mb-2 h-28 overflow-hidden rounded-lg bg-gray-100">
                {starredStreamerIds.has(streamer.id) ? (
                  <span className="absolute right-1 top-1 z-20 inline-flex h-5 w-5 items-center justify-center rounded-full border border-yellow-200 bg-white shadow-sm">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  </span>
                ) : null}
                {streamer.image_url ? (
                  <Image
                    src={streamer.image_url}
                    alt={streamer.nickname || "streamer"}
                    fill
                    priority={index < 4}
                    className="object-cover transition group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <UserRound className="w-7 h-7 text-gray-300" />
                  </div>
                )}
              </div>

              <div className="mb-1 flex items-center justify-between gap-1">
                <p className="truncate text-sm font-semibold text-gray-900 transition-colors group-hover:text-black">
                  {streamer.nickname || "이름 미등록"}
                </p>
                <PlatformBadge platform={streamer.platform || "UNKNOWN"} />
              </div>

              {(streamer.group_name && streamer.group_name.length > 0) ||
                (streamer.crew_name && streamer.crew_name.length > 0) ? (
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {streamer.group_name?.map((group) => (
                    <span
                      key={`${streamer.id}-group-${group}`}
                      className="inline-flex items-center rounded-full border border-pink-100 bg-pink-50 px-2 py-0.5 text-[10px] font-medium text-pink-700"
                    >
                      {groupNameByCode.get(group.trim().toLowerCase()) || group}
                    </span>
                  ))}
                  {streamer.crew_name?.map((crew) => (
                    <span
                      key={`${streamer.id}-crew-${crew}`}
                      className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700"
                    >
                      {crewNameByCode.get(crew.trim().toLowerCase()) || crew}
                    </span>
                  ))}
                </div>
              ) : null}
            </Link>
          ))}
        </div>
      )}

      {!isLoading && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {isFetching && !isLoading && (
        <div className="mt-3 flex justify-center">
          <Spinner className="h-5 w-5 border-2" />
        </div>
      )}

    </div>
  );
}
