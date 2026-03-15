"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import SearchInput from "@/components/common/search-input";
import { STREAMER_PLATFORM_OPTIONS } from "@/lib/constant";
import { Button } from "@/components/ui/button";

type CommunitySortKey = "latest" | "name" | "postCount";

type CommunityDirectoryFiltersProps = {
  initialKeyword: string;
  initialStarredOnly: boolean;
  placeholder: string;
  type: "vlist" | "group" | "crew";
  initialPlatform?: string;
  initialGenre?: string;
  genreOptions?: string[];
  initialSortBy?: CommunitySortKey;
  initialSortOrder?: "asc" | "desc";
};

export default function CommunityDirectoryFilters({
  initialKeyword,
  initialStarredOnly,
  placeholder,
  type,
  initialPlatform = "all",
  initialGenre = "all",
  genreOptions = [],
  initialSortBy = "latest",
  initialSortOrder = "desc",
}: CommunityDirectoryFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [keyword, setKeyword] = useState(initialKeyword ?? "");
  const [platform, setPlatform] = useState(initialPlatform);
  const [genre, setGenre] = useState(initialGenre);
  const [sortBy, setSortBy] = useState<CommunitySortKey>(initialSortBy);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(initialSortOrder);

  function pushNextParams({
    nextKeyword,
    nextStarredOnly,
    nextPlatform = platform,
    nextGenre = genre,
    nextSortBy = sortBy,
    nextSortOrder = sortOrder,
  }: {
    nextKeyword: string | null | undefined;
    nextStarredOnly: boolean;
    nextPlatform?: string;
    nextGenre?: string;
    nextSortBy?: CommunitySortKey;
    nextSortOrder?: "asc" | "desc";
  }) {
    const params = new URLSearchParams(searchParams.toString());
    const trimmedKeyword = (nextKeyword ?? "").trim();

    if (trimmedKeyword) {
      params.set("keyword", trimmedKeyword);
    } else {
      params.delete("keyword");
    }

    if (nextStarredOnly) {
      params.set("starred", "1");
    } else {
      params.delete("starred");
    }

    if (type === "vlist") {
      if (nextPlatform && nextPlatform !== "all") {
        params.set("platform", nextPlatform);
      } else {
        params.delete("platform");
      }

      if (nextGenre && nextGenre !== "all") {
        params.set("genre", nextGenre);
      } else {
        params.delete("genre");
      }
    }

    params.set("sort", nextSortBy);
    params.set("order", nextSortOrder);

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  function handleClickSort(nextSortBy: CommunitySortKey) {
    const nextSortOrder =
      sortBy === nextSortBy
        ? sortOrder === "asc"
          ? "desc"
          : "asc"
        : nextSortBy === "name"
          ? "asc"
          : "desc";

    setSortBy(nextSortBy);
    setSortOrder(nextSortOrder);
    pushNextParams({
      nextKeyword: keyword,
      nextStarredOnly: initialStarredOnly,
      nextSortBy,
      nextSortOrder,
    });
  }

  return (
    <div className="mb-4 space-y-3">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full flex-col gap-3 md:flex-row md:items-center">
        <SearchInput
          value={keyword}
          onChange={(value) => setKeyword(value ?? "")}
          onSearchClick={() =>
            pushNextParams({ nextKeyword: keyword, nextStarredOnly: initialStarredOnly })
          }
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            pushNextParams({ nextKeyword: keyword, nextStarredOnly: initialStarredOnly });
          }}
          placeholder={placeholder}
          containerClassName="w-full md:max-w-sm"
          inputClassName="h-10 border-gray-200 bg-white"
        />

        {type === "vlist" ? (
          <div className="flex flex-nowrap items-center gap-2 overflow-x-auto">
            <select
              value={platform}
              onChange={(event) => {
                const nextValue = event.target.value;
                setPlatform(nextValue);
                pushNextParams({
                  nextKeyword: keyword,
                  nextStarredOnly: initialStarredOnly,
                  nextPlatform: nextValue,
                });
              }}
              className="h-10 w-28 shrink-0 cursor-pointer rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-gray-300"
            >
              {STREAMER_PLATFORM_OPTIONS.map((item) => (
                <option key={`community-vlist-platform-${item.value}`} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            <select
              value={genre}
              onChange={(event) => {
                const nextValue = event.target.value;
                setGenre(nextValue);
                pushNextParams({
                  nextKeyword: keyword,
                  nextStarredOnly: initialStarredOnly,
                  nextGenre: nextValue,
                });
              }}
              className="h-10 w-32 shrink-0 cursor-pointer rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-gray-300 md:w-44"
            >
              <option value="all">전체 장르</option>
              {genreOptions.map((option) => (
                <option key={`community-vlist-genre-${option}`} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={initialStarredOnly}
          onClick={() =>
            pushNextParams({ nextKeyword: keyword, nextStarredOnly: !initialStarredOnly })
          }
          className={`inline-flex h-10 min-w-[112px] cursor-pointer items-center justify-between gap-2 whitespace-nowrap rounded-full border px-3 text-sm font-medium transition-colors ${initialStarredOnly
            ? "border-yellow-400 bg-yellow-50 text-yellow-700"
            : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
            }`}
        >
          <span>즐겨찾기</span>
          <span
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${initialStarredOnly ? "bg-yellow-500" : "bg-gray-300"
              }`}
          >
            <span
              className={`absolute h-4 w-4 rounded-full bg-white transition-transform ${initialStarredOnly ? "translate-x-4" : "translate-x-0.5"
                }`}
            />
          </span>
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant={sortBy === "latest" ? "default" : "outline"}
          onClick={() => handleClickSort("latest")}
          className={`h-9 cursor-pointer ${sortBy === "latest" ? "bg-gray-800 text-white hover:bg-gray-900" : ""}`}
        >
          최신글
        </Button>
        <Button
          type="button"
          size="sm"
          variant={sortBy === "name" ? "default" : "outline"}
          onClick={() => handleClickSort("name")}
          className={`h-9 cursor-pointer ${sortBy === "name" ? "bg-gray-800 text-white hover:bg-gray-900" : ""}`}
        >
          이름순
        </Button>
        <Button
          type="button"
          size="sm"
          variant={sortBy === "postCount" ? "default" : "outline"}
          onClick={() => handleClickSort("postCount")}
          className={`h-9 cursor-pointer ${sortBy === "postCount" ? "bg-gray-800 text-white hover:bg-gray-900" : ""}`}
        >
          글 수
        </Button>
      </div>
    </div>
  );
}
