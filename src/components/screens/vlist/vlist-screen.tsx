"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStreamers } from "@/hooks/queries/streamers/use-streamers";
import { useCreateStreamerRequest } from "@/hooks/mutations/streamers/use-create-streamer-request";
import { useAuthStore } from "@/store/useAuthStore";
import type {
  StreamerPlatform,
  StreamerRequestPlatform,
  StreamerSortOrder,
} from "@/types/streamer";
import { ChevronLeft, ChevronRight, UserRound } from "lucide-react";
import { toast } from "sonner";
import {
  STREAMER_PAGE_SIZE,
  STREAMER_PLATFORM_OPTIONS,
  STREAMER_REQUEST_MODAL_TEXT,
  STREAMER_SORT_OPTIONS,
} from "@/lib/constant";

export default function VlistScreen() {
  const [page, setPage] = useState(1);
  const [platform, setPlatform] = useState<StreamerPlatform>("all");
  const [sortOrder, setSortOrder] = useState<StreamerSortOrder>("asc");
  const [keyword, setKeyword] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [requestPlatform, setRequestPlatform] = useState<StreamerRequestPlatform>("chzzk");
  const [requestUrl, setRequestUrl] = useState("");
  const [requestUrlError, setRequestUrlError] = useState("");
  const { user } = useAuthStore();
  const { mutateAsync: createRequest, isPending: isRequestSubmitting } =
    useCreateStreamerRequest();

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

  const getPlatformActiveClass = (value: StreamerPlatform) => {
    if (value === "all") {
      return "bg-white text-gray-900 border-gray-300 hover:bg-gray-50";
    }
    if (value === "chzzk") {
      return "bg-green-500 text-white border-green-500 hover:bg-green-600";
    }
    return "bg-blue-500 text-white border-blue-500 hover:bg-blue-600";
  };

  const closeModal = () => {
    setRequestUrl("");
    setRequestUrlError("");
    setRequestPlatform("chzzk");
    setIsAddModalOpen(false);
  };

  const extractPlatformIdFromUrl = (
    platformValue: StreamerRequestPlatform,
    rawUrl: string
  ): string | null => {
    const trimmed = rawUrl.trim();
    if (!trimmed) return null;

    // 주소만 붙여 넣어도 파싱되도록 프로토콜 보정
    const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    try {
      const url = new URL(candidate);
      const host = url.hostname.toLowerCase();
      const segments = url.pathname.split("/").filter(Boolean);

      if (platformValue === "chzzk") {
        if (host !== "chzzk.naver.com" || segments.length < 1) return null;
        return segments[0] || null;
      }

      if (
        (host !== "www.sooplive.co.kr" && host !== "sooplive.co.kr") ||
        segments.length < 2 ||
        segments[0] !== "station"
      ) {
        return null;
      }
      return segments[1] || null;
    } catch {
      return null;
    }
  };

  const buildCanonicalStreamerUrl = (
    platformValue: StreamerRequestPlatform,
    streamerId: string
  ) => {
    if (platformValue === "chzzk") {
      return `https://chzzk.naver.com/${streamerId}`;
    }
    return `https://www.sooplive.co.kr/station/${streamerId}`;
  };

  const handleSubmitRequest = async () => {
    if (!requestUrl.trim()) {
      setRequestUrlError(STREAMER_REQUEST_MODAL_TEXT.urlRequired);
      return;
    }

    const extractedId = extractPlatformIdFromUrl(requestPlatform, requestUrl);
    if (!extractedId) {
      setRequestUrlError(STREAMER_REQUEST_MODAL_TEXT.urlInvalid);
      return;
    }

    if (!user) {
      toast.error("로그인 후 요청할 수 있습니다.");
      return;
    }

    try {
      const normalizedUrl = buildCanonicalStreamerUrl(requestPlatform, extractedId);

      await createRequest({
        requesterId: user.id,
        platform: requestPlatform,
        platformStreamerId: extractedId,
        platformStreamerUrl: normalizedUrl,
      });
      toast.success(STREAMER_REQUEST_MODAL_TEXT.submitSuccess);
      closeModal();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : STREAMER_REQUEST_MODAL_TEXT.alreadyPending;
      toast.error(message);
    }
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
                className={`cursor-pointer ${platform === item.value ? getPlatformActiveClass(item.value) : "border-gray-200 text-gray-600"}`}
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
              size="sm"
              variant="outline"
              onClick={() => setIsAddModalOpen(true)}
              className="cursor-pointer whitespace-nowrap border-gray-200 text-gray-700"
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
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center text-gray-500">
          로딩중...
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

              <div className="space-y-1 text-xs text-gray-500">
                {streamer.group_name && streamer.group_name.length > 0 && (
                  <p className="truncate">그룹: {streamer.group_name.join(", ")}</p>
                )}
              </div>
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
        <p className="mt-3 text-center text-xs text-gray-400">로딩중...</p>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">
              {STREAMER_REQUEST_MODAL_TEXT.title}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {STREAMER_REQUEST_MODAL_TEXT.description}
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <p className="mb-2 text-sm text-gray-600">플랫폼</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={requestPlatform === "chzzk" ? "default" : "outline"}
                    onClick={() => setRequestPlatform("chzzk")}
                    className={`cursor-pointer ${requestPlatform === "chzzk" ? "bg-green-500 hover:bg-green-600 text-white" : ""}`}
                  >
                    치지직
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={requestPlatform === "soop" ? "default" : "outline"}
                    onClick={() => setRequestPlatform("soop")}
                    className={`cursor-pointer ${requestPlatform === "soop" ? "bg-blue-500 hover:bg-blue-600 text-white" : ""}`}
                  >
                    SOOP
                  </Button>
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm text-gray-600">
                  {requestPlatform === "chzzk" ? "치지직 채널 주소" : "SOOP 방송국 주소"}
                </p>
                <Input
                  value={requestUrl}
                  onChange={(e) => {
                    setRequestUrl(e.target.value);
                    if (e.target.value.trim()) {
                      setRequestUrlError("");
                    }
                  }}
                  placeholder={
                    requestPlatform === "chzzk"
                      ? "치지직 채널 주소를 입력해 주세요"
                      : "SOOP 방송국 주소를 입력해 주세요"
                  }
                  className={`h-10 bg-white ${requestUrlError ? "border-red-400 focus-visible:ring-red-200" : "border-gray-200"}`}
                />
                {requestUrlError && (
                  <p className="mt-1 text-xs text-red-500">{requestUrlError}</p>
                )}
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeModal}
                className="cursor-pointer"
              >
                {STREAMER_REQUEST_MODAL_TEXT.cancelButton}
              </Button>
              <Button
                type="button"
                onClick={handleSubmitRequest}
                disabled={isRequestSubmitting}
                className="cursor-pointer bg-gray-800 hover:bg-gray-900 text-white"
              >
                {isRequestSubmitting ? "처리중..." : STREAMER_REQUEST_MODAL_TEXT.submitButton}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
