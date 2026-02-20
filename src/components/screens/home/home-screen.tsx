"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserRound } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchStreamerHeartLeaderboard,
} from "@/api/heart";
import type { StreamerHeartLeaderboardItem } from "@/types/heart";
import { useLiveStreamers } from "@/hooks/queries/live/use-live-streamers";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchStarredStreamerIds } from "@/api/star";

export default function HomeScreen() {
  const { user } = useAuthStore();
  const { data: liveData, isLoading: isLiveLoading } = useLiveStreamers();
  const {
    data: allRank = [],
    isLoading: isAllRankLoading,
  } = useQuery({
    queryKey: ["home-heart-rank", "all"],
    queryFn: () => fetchStreamerHeartLeaderboard("all", 5),
  });
  const {
    data: monthlyRank = [],
    isLoading: isMonthlyRankLoading,
    isError: isMonthlyRankError,
  } = useQuery({
    queryKey: ["home-heart-rank", "monthly"],
    queryFn: () => fetchStreamerHeartLeaderboard("monthly", 5),
  });
  const {
    data: weeklyRank = [],
    isLoading: isWeeklyRankLoading,
    isError: isWeeklyRankError,
  } = useQuery({
    queryKey: ["home-heart-rank", "weekly"],
    queryFn: () => fetchStreamerHeartLeaderboard("weekly", 5),
  });

  const rankCards: Array<{
    key: string;
    title: string;
    data: StreamerHeartLeaderboardItem[];
    isLoading: boolean;
    isError?: boolean;
  }> = [
      {
        key: "all",
        title: "총 하트 TOP 5",
        data: allRank,
        isLoading: isAllRankLoading,
      },
      {
        key: "monthly",
        title: "이번달 하트 TOP 5",
        data: monthlyRank,
        isLoading: isMonthlyRankLoading,
        isError: isMonthlyRankError,
      },
      {
        key: "weekly",
        title: "이번주 하트 TOP 5",
        data: weeklyRank,
        isLoading: isWeeklyRankLoading,
        isError: isWeeklyRankError,
      },
    ];
  const getRankRows = (items: StreamerHeartLeaderboardItem[]) =>
    items.filter((item) => (item.total_received ?? 0) > 0).slice(0, 5);
  const topLiveStreamers = useMemo(() => {
    const source = (liveData || []).filter((item) => item.isLive);
    const shuffled = [...source];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 4);
  }, [liveData]);
  const { data: starredStreamerIds = [] } = useQuery({
    queryKey: ["home-starred-streamers", user?.id],
    queryFn: () => fetchStarredStreamerIds(user!.id),
    enabled: Boolean(user?.id),
  });
  const liveFavoriteStreamers = useMemo(() => {
    const idSet = new Set(starredStreamerIds);
    return (liveData || []).filter((item) => item.isLive && idSet.has(item.id));
  }, [liveData, starredStreamerIds]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <section className="mx-auto w-full max-w-[1200px]">
        <div className="h-[200px] md:h-[200px] rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold text-gray-800">배너 영역</h2>
          <p className="mt-2 text-sm text-gray-500">
            버츄얼 광고(생일, 앨범홍보, 컨텐츠홍보) 배너등록 준비중
          </p>
        </div>
      </section>

      <section className="p-4 md:p-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {rankCards.map((card) => (
            <div
              key={card.key}
              className="rounded-2xl border border-gray-100 bg-white p-4"
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-800">{card.title}</h3>
              </div>

              {card.isLoading ? (
                <div className="space-y-3">
                  {[0, 1, 2, 3, 4].map((slotIndex) => (
                    <div
                      key={`home-heart-skeleton-${card.key}-${slotIndex}`}
                      className="flex items-center gap-3"
                    >
                      <Skeleton className="h-9 w-9 rounded-full" />
                      <div className="flex-1 space-y-1">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : card.isError ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  랭킹 조회에 실패했습니다.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {[0, 1, 2, 3, 4].map((index) => {
                    const item = getRankRows(card.data)[index];
                    if (!item) {
                      return (
                        <div
                          key={`${card.key}-empty-${index}`}
                          className="flex items-center gap-3 rounded-xl px-2 py-1.5"
                        >
                          <span className="w-7 text-xs font-bold text-gray-300">
                            {index + 1}위
                          </span>
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                            <UserRound className="h-4 w-4 text-gray-300" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-300">
                              -
                            </p>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={`${card.key}-${item.streamer_id}`}
                        href={`/vlist/${item.public_id ?? item.streamer_id}`}
                        className="group flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-gray-50"
                      >
                        <span className="w-7 text-xs font-bold text-gray-500">
                          {index + 1}위
                        </span>
                        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gray-100">
                          {item.image_url ? (
                            <Image
                              src={item.image_url}
                              alt={item.nickname || "virtual"}
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <UserRound className="h-4 w-4 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900">
                            {item.nickname || "이름 미등록"}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="p-4 md:p-6">
        {isLiveLoading ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {[0, 1].map((cardIndex) => (
              <div
                key={`home-live-skeleton-card-${cardIndex}`}
                className="rounded-2xl border border-gray-100 bg-white p-4"
              >
                <Skeleton className="mb-4 h-5 w-16 rounded-full" />
                <div className="grid grid-cols-4 gap-2 md:gap-3">
                  {[0, 1, 2, 3].map((slotIndex) => (
                    <div
                      key={`home-live-skeleton-slot-${cardIndex}-${slotIndex}`}
                      className="rounded-xl p-2 text-center"
                    >
                      <Skeleton className="mx-auto mb-2 h-14 w-14 rounded-full md:h-20 md:w-20" />
                      <Skeleton className="mx-auto hidden h-3 w-16 md:block" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="inline-flex items-center justify-center rounded-full bg-red-600 px-2 py-0.5 text-[10px] text-white">
                  LIVE
                </span>
                <Link
                  href="/live"
                  className="text-xs font-medium text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline"
                >
                  전체
                </Link>
              </div>
              {topLiveStreamers.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  라이브중인 버츄얼이 없습니다.
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 md:gap-3">
                  {[0, 1, 2, 3].map((index) => {
                    const streamer = topLiveStreamers[index];
                    if (!streamer) {
                      return (
                        <div
                          key={`live-empty-${index}`}
                          className="rounded-xl p-2 text-center"
                        >
                          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-50/70 md:h-20 md:w-20">
                            <UserRound className="h-5 w-5 text-gray-300 md:h-7 md:w-7" />
                          </div>
                          <p className="hidden truncate text-xs text-transparent md:block">.</p>
                        </div>
                      );
                    }

                    const ringClass =
                      streamer.platform === "chzzk"
                        ? "border-green-500"
                        : "border-blue-500";

                    return (
                      <div key={streamer.id} className="rounded-xl p-2 text-center">
                        <Link
                          href={streamer.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex cursor-pointer"
                        >
                          <div
                            className={`mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full border-2 bg-gray-100 p-0.5 md:h-20 md:w-20 ${ringClass}`}
                          >
                            <div className="relative h-full w-full overflow-hidden rounded-full">
                              {streamer.image_url ? (
                                <Image
                                  src={streamer.image_url}
                                  alt={streamer.nickname || "streamer"}
                                  fill
                                  sizes="80px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <UserRound className="h-7 w-7 text-gray-300" />
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                        <p className="hidden truncate text-xs font-semibold text-gray-900 md:block">
                          {streamer.nickname || "이름 미등록"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="inline-flex items-center justify-center rounded-full bg-yellow-500 px-2 py-0.5 text-[10px] text-white">
                  STAR
                </span>
                <Link
                  href="/star"
                  className="text-xs font-medium text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline"
                >
                  전체
                </Link>
              </div>
              {!user ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  로그인 후 이용해 주세요.
                </div>
              ) : starredStreamerIds.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  <Link href="/vlist" className="underline underline-offset-2 hover:text-gray-700">
                    즐겨찾기하러가기
                  </Link>
                </div>
              ) : liveFavoriteStreamers.length === 0 ? (
                <div className="py-8 text-center text-sm text-gray-400">
                  즐겨찾기한 버츄얼 중 라이브 중인 버츄얼이 없습니다.
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 md:gap-3">
                  {[0, 1, 2, 3].map((index) => {
                    const streamer = liveFavoriteStreamers[index];
                    if (!streamer) {
                      return (
                        <div key={`favorite-empty-${index}`} className="rounded-xl p-2 text-center">
                          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-50 md:h-20 md:w-20">
                            <UserRound className="h-5 w-5 text-gray-300 md:h-7 md:w-7" />
                          </div>
                          <p className="hidden truncate text-xs text-transparent md:block">.</p>
                        </div>
                      );
                    }

                    const ringClass =
                      streamer.platform === "chzzk"
                        ? "border-green-500"
                        : "border-blue-500";

                    return (
                      <div key={`favorite-live-${streamer.id}`} className="rounded-xl p-2 text-center">
                        <Link
                          href={streamer.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex cursor-pointer"
                        >
                          <div
                            className={`mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full border-2 bg-gray-100 p-0.5 md:h-20 md:w-20 ${ringClass}`}
                          >
                            <div className="relative h-full w-full overflow-hidden rounded-full">
                              {streamer.image_url ? (
                                <Image
                                  src={streamer.image_url}
                                  alt={streamer.nickname || "streamer"}
                                  fill
                                  sizes="80px"
                                  className="object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <UserRound className="h-7 w-7 text-gray-300" />
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                        <p className="hidden truncate text-xs font-semibold text-gray-900 md:block">
                          {streamer.nickname || "이름 미등록"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
