"use client";

import { useMemo, useState } from "react";
import { TvMinimalPlay } from "lucide-react";
import { useStreamers } from "@/hooks/queries/admin/use-streamers";
import { StreamerTable } from "@/components/screens/admin/users-tables";
import SearchInput from "@/components/common/search-input";
import { Button } from "@/components/ui/button";
import type { Streamer, StreamerSortOrder } from "@/types/streamer";

type AdminStreamerSortKey = "createdAt" | "name" | "birthday";

function getBirthdaySortValue(birthday?: string | null) {
  if (!birthday) return Number.MAX_SAFE_INTEGER;

  const matched = birthday.match(/(\d{1,2})\D+(\d{1,2})/);
  if (!matched) return Number.MAX_SAFE_INTEGER;

  const month = Number(matched[1]);
  const day = Number(matched[2]);

  if (!month || !day) return Number.MAX_SAFE_INTEGER;
  return month * 100 + day;
}

function sortStreamers(
  streamers: Streamer[],
  sortKey: AdminStreamerSortKey,
  sortOrder: StreamerSortOrder
) {
  const sorted = [...streamers];

  sorted.sort((left, right) => {
    if (sortKey === "name") {
      const nameDiff = (left.nickname || "").localeCompare(right.nickname || "", "ko");
      return sortOrder === "asc" ? nameDiff : nameDiff * -1;
    }

    if (sortKey === "birthday") {
      const birthdayDiff =
        getBirthdaySortValue(left.birthday) - getBirthdaySortValue(right.birthday);
      if (birthdayDiff !== 0) return sortOrder === "asc" ? birthdayDiff : birthdayDiff * -1;
      const nameDiff = (left.nickname || "").localeCompare(right.nickname || "", "ko");
      return sortOrder === "asc" ? nameDiff : nameDiff * -1;
    }

    const createdAtDiff =
      new Date(right.created_at || 0).getTime() - new Date(left.created_at || 0).getTime()
    ;
    return sortOrder === "asc" ? createdAtDiff * -1 : createdAtDiff;
  });

  return sorted;
}

export default function StreamersScreen() {
  const { data: streamers, isLoading } = useStreamers();
  const [keyword, setKeyword] = useState("");
  const [platformFilter, setPlatformFilter] = useState<"all" | "chzzk" | "soop">("all");
  const [genreFilter, setGenreFilter] = useState("all");
  const [sortKey, setSortKey] = useState<AdminStreamerSortKey>("createdAt");
  const [sortOrder, setSortOrder] = useState<StreamerSortOrder>("desc");

  const handleSortChange = (nextSortKey: AdminStreamerSortKey) => {
    if (sortKey === nextSortKey) {
      setSortOrder((currentSortOrder) => (currentSortOrder === "asc" ? "desc" : "asc"));
      return;
    }

    setSortKey(nextSortKey);
    setSortOrder(nextSortKey === "createdAt" ? "desc" : "asc");
  };

  const genreOptions = useMemo(() => {
    if (!streamers) return [];

    return Array.from(
      new Set(
        streamers.flatMap((streamer) => streamer.genre || []).filter(Boolean)
      )
    ).sort((left, right) => left.localeCompare(right, "ko"));
  }, [streamers]);

  const filteredStreamers = useMemo(() => {
    if (!streamers) return streamers;
    const normalizedKeyword = keyword.trim().toLowerCase();

    const matched = streamers.filter((streamer) => {
      const matchesKeyword =
        !normalizedKeyword ||
        (streamer.nickname || "").toLowerCase().includes(normalizedKeyword);
      const matchesPlatform =
        platformFilter === "all" || streamer.platform === platformFilter;
      const matchesGenre =
        genreFilter === "all" || Boolean(streamer.genre?.includes(genreFilter));

      return matchesKeyword && matchesPlatform && matchesGenre;
    });

    return sortStreamers(matched, sortKey, sortOrder);
  }, [genreFilter, keyword, platformFilter, sortKey, sortOrder, streamers]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <section>
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-50 p-2">
              <TvMinimalPlay className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">버츄얼 관리</h2>
              <p className="text-xs text-gray-400">
                {streamers ? `총 ${streamers.length}명` : "로딩 중..."}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">플랫폼</span>
                <select
                  value={platformFilter}
                  onChange={(event) =>
                    setPlatformFilter(event.target.value as "all" | "chzzk" | "soop")
                  }
                  className="h-9 min-w-[132px] rounded-md border border-gray-200 bg-white px-3 text-sm"
                >
                  <option value="all">전체</option>
                  <option value="chzzk">chzzk</option>
                  <option value="soop">soop</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">장르</span>
                <select
                  value={genreFilter}
                  onChange={(event) => setGenreFilter(event.target.value)}
                  className="h-9 min-w-[148px] rounded-md border border-gray-200 bg-white px-3 text-sm"
                >
                  <option value="all">전체</option>
                  {genreOptions.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">정렬</span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant={sortKey === "name" ? "default" : "outline"}
                    className="h-9 cursor-pointer"
                    onClick={() => handleSortChange("name")}
                  >
                    이름순{sortKey === "name" ? (sortOrder === "asc" ? " ↑" : " ↓") : ""}
                  </Button>
                  <Button
                    type="button"
                    variant={sortKey === "createdAt" ? "default" : "outline"}
                    className="h-9 cursor-pointer"
                    onClick={() => handleSortChange("createdAt")}
                  >
                    등록순{sortKey === "createdAt" ? (sortOrder === "asc" ? " ↑" : " ↓") : ""}
                  </Button>
                  <Button
                    type="button"
                    variant={sortKey === "birthday" ? "default" : "outline"}
                    className="h-9 cursor-pointer"
                    onClick={() => handleSortChange("birthday")}
                  >
                    생일순{sortKey === "birthday" ? (sortOrder === "asc" ? " ↑" : " ↓") : ""}
                  </Button>
                </div>
              </div>
            </div>
            <SearchInput
              value={keyword}
              onChange={setKeyword}
              placeholder="버츄얼 닉네임 검색"
              inputClassName="h-9 w-full xl:w-64"
              containerClassName="w-full xl:w-64"
            />
          </div>
        </div>
        <StreamerTable streamers={filteredStreamers} isLoading={isLoading} />
      </section>
    </div>
  );
}
