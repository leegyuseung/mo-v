"use client";

import { useMemo, useState } from "react";
import { TvMinimalPlay } from "lucide-react";
import { useAdminStreamersPage } from "@/hooks/queries/admin/use-admin-streamers-page";
import { useStreamerGenres } from "@/hooks/queries/streamers/use-streamer-genres";
import { StreamerTable } from "@/components/screens/admin/users-tables";
import SearchInput from "@/components/common/search-input";
import Pagination from "@/components/common/pagination";
import { Button } from "@/components/ui/button";
import type { StreamerSortOrder } from "@/types/streamer";
import type { AdminStreamerSortKey } from "@/types/admin-streamer";
const STREAMERS_PAGE_SIZE = 20;

export default function StreamersScreen() {
  const [keyword, setKeyword] = useState("");
  const [platformFilter, setPlatformFilter] = useState<"all" | "chzzk" | "soop">("all");
  const [genreFilter, setGenreFilter] = useState("all");
  const [sortKey, setSortKey] = useState<AdminStreamerSortKey>("createdAt");
  const [sortOrder, setSortOrder] = useState<StreamerSortOrder>("desc");
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({
      page,
      pageSize: STREAMERS_PAGE_SIZE,
      keyword,
      platform: platformFilter,
      genre: genreFilter,
      sortKey,
      sortOrder,
    }),
    [genreFilter, keyword, page, platformFilter, sortKey, sortOrder]
  );

  const { data, isLoading } = useAdminStreamersPage(queryParams);
  const { data: genreOptions = [] } = useStreamerGenres();
  const streamers = data?.data;
  const totalCount = data?.count || 0;

  const handleSortChange = (nextSortKey: AdminStreamerSortKey) => {
    if (sortKey === nextSortKey) {
      setSortOrder((currentSortOrder) => (currentSortOrder === "asc" ? "desc" : "asc"));
      setPage(1);
      return;
    }

    setSortKey(nextSortKey);
    setSortOrder(nextSortKey === "createdAt" ? "desc" : "asc");
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / STREAMERS_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

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
                {data ? `총 ${totalCount}명` : "로딩 중..."}
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
                    {
                      setPlatformFilter(event.target.value as "all" | "chzzk" | "soop");
                      setPage(1);
                    }
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
                  onChange={(event) => {
                    setGenreFilter(event.target.value);
                    setPage(1);
                  }}
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
              onChange={(value) => {
                setKeyword(value);
                setPage(1);
              }}
              placeholder="버츄얼 닉네임 검색"
              inputClassName="h-9 w-full xl:w-64"
              containerClassName="w-full xl:w-64"
            />
          </div>
        </div>
        <StreamerTable streamers={streamers} isLoading={isLoading} />
        <Pagination
          page={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </section>
    </div>
  );
}
