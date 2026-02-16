"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useStreamers } from "@/hooks/queries/streamers/use-streamers";
import type {
  StreamerPlatform,
  StreamerSortOrder,
} from "@/types/streamer";
import { ChevronLeft, ChevronRight, UserRound } from "lucide-react";
import {
  STREAMER_PAGE_SIZE,
  STREAMER_PLATFORM_OPTIONS,
  STREAMER_SORT_OPTIONS,
} from "@/lib/constant";
import StreamerRequestModal from "@/components/screens/vlist/streamer-request-modal";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

export default function VlistScreen() {
  const [page, setPage] = useState(1);
  const [platform, setPlatform] = useState<StreamerPlatform>("all");
  const [sortOrder, setSortOrder] = useState<StreamerSortOrder>("asc");
  const [keyword, setKeyword] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { user } = useAuthStore();

  const { data, isLoading, isFetching } = useStreamers({
    page,
    pageSize: STREAMER_PAGE_SIZE,
    platform,
    sortOrder,
    keyword,
  });

  const streamers = data?.data || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / STREAMER_PAGE_SIZE));

  const pageNumbers = useMemo(() => {
    const size = 5;
    const half = Math.floor(size / 2);
    const start = Math.max(1, page - half);
    const end = Math.min(totalPages, start + size - 1);
    const adjustedStart = Math.max(1, end - size + 1);
    return Array.from({ length: end - adjustedStart + 1 }, (_, i) => adjustedStart + i);
  }, [page, totalPages]);

  const onChangePlatform = (next: StreamerPlatform) => {
    setPlatform(next);
    setPage(1);
  };

  const onChangeSort = (next: StreamerSortOrder) => {
    setSortOrder(next);
    setPage(1);
  };

  const onChangeKeyword = (value: string) => {
    setKeyword(value);
    setPage(1);
  };

  const onClickAddStreamer = () => {
    if (!user) {
      toast.error("로그인 후 스트리머 추가 요청이 가능합니다.");
      return;
    }
    setIsAddModalOpen(true);
  };

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
                onClick={() => onChangePlatform(item.value)}
                className={`cursor-pointer ${
                  platform === item.value
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
              onChange={(e) => onChangeKeyword(e.target.value)}
              placeholder="스트리머 명을 입력해 주세요"
              className="h-9 border-gray-200 bg-white md:w-80"
            />
            <Button
              type="button"
              variant="outline"
              onClick={onClickAddStreamer}
              disabled={!user}
              className="h-9 cursor-pointer whitespace-nowrap border-gray-200 text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              스트리머 추가
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">정렬</span>
          {STREAMER_SORT_OPTIONS.map((item) => (
            <Button
              key={item.value}
              type="button"
              size="sm"
              variant={sortOrder === item.value ? "default" : "outline"}
              onClick={() => onChangeSort(item.value)}
              className={`cursor-pointer ${sortOrder === item.value ? "bg-gray-800 hover:bg-gray-900 text-white" : ""}`}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="mb-4 text-sm text-gray-500">
        {isLoading ? "로딩중..." : `총 ${totalCount.toLocaleString()}명의 스트리머`}
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 flex items-center justify-center">
          <Spinner />
        </div>
      ) : streamers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-gray-400">
          스트리머 정보가 없습니다.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {streamers.map((streamer) => (
            <Link
              key={streamer.id}
              href={`/vlist/${streamer.id}`}
              className="group rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative mb-2 h-28 overflow-hidden rounded-lg bg-gray-100">
                {streamer.image_url ? (
                  <Image
                    src={streamer.image_url}
                    alt={streamer.nickname || "streamer"}
                    fill
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

              {(streamer.group_name && streamer.group_name.length > 0) ||
              (streamer.crew_name && streamer.crew_name.length > 0) ? (
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {streamer.group_name?.map((group) => (
                    <span
                      key={`${streamer.id}-group-${group}`}
                      className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2 py-0.5 text-[10px] font-medium text-gray-600"
                    >
                      {group}
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
          ))}
        </div>
      )}

      {!isLoading && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-1.5">
          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            className="cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {pageNumbers.map((num) => (
            <Button
              key={num}
              type="button"
              size="sm"
              variant={num === page ? "default" : "outline"}
              onClick={() => setPage(num)}
              className={`cursor-pointer ${num === page ? "bg-gray-800 hover:bg-gray-900 text-white" : ""}`}
            >
              {num}
            </Button>
          ))}

          <Button
            type="button"
            size="icon-sm"
            variant="outline"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            className="cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {isFetching && !isLoading && (
        <div className="mt-3 flex justify-center">
          <Spinner className="h-5 w-5 border-2" />
        </div>
      )}

      <StreamerRequestModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
