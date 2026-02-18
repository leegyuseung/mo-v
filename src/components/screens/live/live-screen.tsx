"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ExternalLink, Eye, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useLiveStreamers } from "@/hooks/queries/live/use-live-streamers";
import { useIdolGroupCodeNames } from "@/hooks/queries/groups/use-idol-group-code-names";
import type { StreamerPlatform } from "@/types/streamer";
import { STREAMER_PLATFORM_OPTIONS } from "@/lib/constant";

export default function LiveScreen() {
  const [platform, setPlatform] = useState<StreamerPlatform>("all");
  const [keyword, setKeyword] = useState("");
  const [sortOrder, setSortOrder] = useState<
    "name_asc" | "name_desc" | "viewer_desc" | "viewer_asc"
  >("name_asc");
  const [brokenImageByStreamerId, setBrokenImageByStreamerId] = useState<
    Record<number, boolean>
  >({});
  const { data, isLoading } = useLiveStreamers();
  const { data: idolGroups } = useIdolGroupCodeNames();

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
  }, [data, keyword, platform, sortOrder]);

  const isNameSort = sortOrder === "name_asc" || sortOrder === "name_desc";
  const isViewerSort = sortOrder === "viewer_desc" || sortOrder === "viewer_asc";
  const groupNameByCode = useMemo(() => {
    const map = new Map<string, string>();
    (idolGroups || []).forEach((group) => {
      map.set(group.group_code.trim().toLowerCase(), group.name);
    });
    return map;
  }, [idolGroups]);

  const getPlatformActiveClass = (value: StreamerPlatform) => {
    if (value === "all") {
      return "bg-white text-gray-900 border-gray-300 hover:bg-gray-50";
    }
    if (value === "chzzk") {
      return "bg-green-500 text-white border-green-500 hover:bg-green-600 hover:text-white";
    }
    return "bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:text-white";
  };

  const getPlatformInactiveClass = (value: StreamerPlatform) => {
    if (value === "all") {
      return "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800";
    }
    if (value === "chzzk") {
      return "border-gray-200 text-gray-600 hover:bg-green-50 hover:border-green-300 hover:text-green-700";
    }
    return "border-gray-200 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700";
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
                onClick={() => setPlatform(item.value)}
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
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="스트리머 명을 입력해 주세요"
              className="h-9 border-gray-200 bg-white md:w-80"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">정렬</span>
          <Button
            type="button"
            size="sm"
            variant="default"
            onClick={() =>
              setSortOrder((prev) =>
                prev === "name_asc"
                  ? "name_desc"
                  : prev === "name_desc"
                    ? "name_asc"
                    : "name_asc"
              )
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
              setSortOrder((prev) =>
                prev === "viewer_desc"
                  ? "viewer_asc"
                  : prev === "viewer_asc"
                    ? "viewer_desc"
                    : "viewer_desc"
              )
            }
            className={`cursor-pointer ${isViewerSort
              ? "bg-gray-800 hover:bg-gray-900 text-white"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
          >
            시청자 수
          </Button>
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-500">
        {isLoading
          ? "현재 라이브 데이터를 불러오는 중"
          : `현재 라이브 중 ${filteredLiveStreamers.length.toLocaleString()}명`}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {[...Array(10)].map((_, index) => (
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
      ) : filteredLiveStreamers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-gray-400">
          현재 라이브중인 스트리머가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filteredLiveStreamers.map((streamer, index) => {
            const liveThumbSrc = streamer.liveThumbnailImageUrl || "";
            const fallbackSrc = streamer.image_url || "";
            const hasLiveThumb = Boolean(liveThumbSrc);
            const useFallback = brokenImageByStreamerId[streamer.id] === true;
            const imageSrc = useFallback
              ? fallbackSrc
              : liveThumbSrc || fallbackSrc;
            const isLiveThumb = hasLiveThumb && !useFallback;
            const shouldBypassOptimizer =
              imageSrc.includes("livecloud-thumb.akamaized.net");

            return (
              <Link
                key={streamer.id}
                href={streamer.liveUrl}
                target="_blank"
                rel="noreferrer"
                className={`group rounded-xl border bg-white p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                  streamer.platform === "chzzk"
                    ? "border-green-200"
                    : "border-blue-200"
                }`}
              >
                <div className="relative mb-2 h-28 overflow-hidden rounded-lg bg-gray-100">
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={streamer.nickname || "streamer"}
                      fill
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw"
                      loading={index === 0 ? "eager" : "lazy"}
                      priority={index === 0}
                      unoptimized={shouldBypassOptimizer}
                      onError={() => {
                        if (hasLiveThumb && !useFallback && fallbackSrc) {
                          setBrokenImageByStreamerId((prev) => ({
                            ...prev,
                            [streamer.id]: true,
                          }));
                        }
                      }}
                      className="object-cover transition group-hover:scale-[1.03]"
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

                {(streamer.group_name && streamer.group_name.length > 0) ||
                  (streamer.crew_name && streamer.crew_name.length > 0) ? (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {streamer.group_name?.map((group) => (
                      <span
                        key={`${streamer.id}-group-${group}`}
                        className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-medium text-gray-600"
                      >
                        {groupNameByCode.get(group.trim().toLowerCase()) || group}
                      </span>
                    ))}
                    {streamer.crew_name?.map((crew) => (
                      <span
                        key={`${streamer.id}-crew-${crew}`}
                        className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700"
                      >
                        {crew}
                      </span>
                    ))}
                  </div>
                ) : null}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
