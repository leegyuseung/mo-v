"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { CalendarClock, Tag, UserRound, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { StreamerHeartLeaderboardItem } from "@/types/heart";
import { useLiveStreamers } from "@/hooks/queries/live/use-live-streamers";
import { useLiveBoxes } from "@/hooks/queries/live-box/use-live-boxes";
import { useAuthStore } from "@/store/useAuthStore";
import { useHeartLeaderboard } from "@/hooks/queries/heart/use-heart-leaderboard";
import { useStarredStreamerIds } from "@/hooks/queries/star/use-starred-streamer-ids";
import { generateArray } from "@/utils/array";

/** 홈 화면에 표시할 최대 라이브박스 개수 */
const HOME_LIVE_BOX_COUNT = 3;

function getStatusBadgeClass(status: string) {
  if (status === "진행중") return "bg-green-50 text-green-700 border-green-200";
  if (status === "종료") return "bg-gray-100 text-gray-600 border-gray-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
}

function formatEndsAt(value: string | null) {
  if (!value) return "미설정";
  return new Date(value).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function HomeScreen() {
  const { user } = useAuthStore();

  /* ─────────── 데이터 페치(라이브박스) ─────────── */
  const { data: liveBoxData = [], isLoading: isLiveBoxLoading, isError: isLiveBoxError } = useLiveBoxes();

  /** 진행중인 라이브박스만 셔플하여 최대 3개 표시 */
  const topLiveBoxes = useMemo(() => {
    const ongoing = liveBoxData.filter((box) => box.status === "진행중");
    const shuffled = [...ongoing];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, HOME_LIVE_BOX_COUNT);
  }, [liveBoxData]);

  /* ─────────── 데이터 페치(하트 랭킹) ─────────── */
  const { data: liveData, isLoading: isLiveLoading } = useLiveStreamers();
  const {
    data: allRank = [],
    isLoading: isAllRankLoading,
  } = useHeartLeaderboard("all", 5);
  const {
    data: monthlyRank = [],
    isLoading: isMonthlyRankLoading,
    isError: isMonthlyRankError,
  } = useHeartLeaderboard("monthly", 5);
  const {
    data: weeklyRank = [],
    isLoading: isWeeklyRankLoading,
    isError: isWeeklyRankError,
  } = useHeartLeaderboard("weekly", 5);

  /** 랭킹 카드 배열: 전체 / 이번달 / 이번주 */
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

  /** 0보다 큰 하트를 가진 항목만 최대 5개까지 반환한다 */
  const getRankRows = (items: StreamerHeartLeaderboardItem[]) =>
    items.filter((item) => (item.total_received ?? 0) > 0).slice(0, 5);

  /* ─────────── 라이브 중인 스트리머 셔플 ─────────── */
  const topLiveStreamers = useMemo(() => {
    const source = (liveData || []).filter((item) => item.isLive);
    const shuffled = [...source];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 4);
  }, [liveData]);

  /* ─────────── 즐겨찾기 + 라이브 ─────────── */
  const { data: starredStreamerIds = [] } = useStarredStreamerIds(user?.id);
  const liveFavoriteStreamers = useMemo(() => {
    const idSet = new Set(starredStreamerIds);
    return (liveData || []).filter((item) => item.isLive && idSet.has(item.id));
  }, [liveData, starredStreamerIds]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-2">
      {/* ─── 배너 영역 ─── */}
      <section className="mx-auto w-full max-w-[1200px]">
        <div className="h-[200px] md:h-[200px] rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold text-gray-800">배너 영역</h2>
          <p className="mt-2 text-sm text-gray-500">
            버츄얼 광고(생일, 앨범홍보, 컨텐츠홍보) 배너등록 준비중
          </p>
        </div>
      </section>

      {/* ─── 하트 랭킹 카드 섹션 ─── */}
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
                  {generateArray(5).map((_, slotIndex) => (
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
                <div className="space-y-0.5">
                  {generateArray(5).map((_, index) => {
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
                              loading="lazy"
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

      {/* ─── 라이브 & 즐겨찾기 카드 섹션 ─── */}
      <section className="p-4 md:p-6">
        {isLiveLoading ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {generateArray(2).map((_, cardIndex) => (
              <div
                key={`home-live-skeleton-card-${cardIndex}`}
                className="rounded-2xl border border-gray-100 bg-white p-4"
              >
                <Skeleton className="mb-4 h-5 w-16 rounded-full" />
                <div className="grid grid-cols-4 gap-2 md:gap-3">
                  {generateArray(4).map((_, slotIndex) => (
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
            {/* ── LIVE 카드 ── */}
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
                  {generateArray(4).map((_, index) => {
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
                                  sizes="(min-width: 768px) 80px, 56px"
                                  priority={index === 0}
                                  loading={index === 0 ? "eager" : "lazy"}
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

            {/* ── STAR(즐겨찾기) 카드 ── */}
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
                  {generateArray(4).map((_, index) => {
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
                                  sizes="(min-width: 768px) 80px, 56px"
                                  loading="lazy"
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

      {/* ─── 라이브박스 섹션 ─── */}
      <section className="p-4 md:p-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="inline-flex items-center justify-center rounded-full bg-violet-600 px-2 py-0.5 text-[10px] text-white">
              LIVE BOX
            </span>
            <Link
              href="/live-box"
              className="text-xs font-medium text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline"
            >
              전체
            </Link>
          </div>

          {isLiveBoxLoading ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {generateArray(3).map((_, i) => (
                <div key={`home-livebox-skeleton-${i}`} className="rounded-xl border border-gray-100 p-3 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          ) : isLiveBoxError ? (
            <div className="py-8 text-center text-sm text-gray-400">
              라이브박스를 불러오지 못했습니다.
            </div>
          ) : topLiveBoxes.length === 0 ? (
            <div className="py-8 text-center text-sm text-gray-400">
              진행중인 라이브박스가 없습니다.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              {topLiveBoxes.map((box) => (
                <Link
                  key={box.id}
                  href={`/live-box/${box.id}`}
                  className="group block rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-gray-400 hover:bg-gray-50/40 hover:shadow-[0_14px_28px_-14px_rgba(0,0,0,0.45)]"
                >
                  {/* 제목 + 상태 */}
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">
                      {box.title}
                    </h4>
                    <span
                      className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${getStatusBadgeClass(box.status)}`}
                    >
                      {box.status}
                    </span>
                  </div>

                  {/* 카테고리 */}
                  <div className="mb-2 flex items-center gap-1 text-xs text-gray-500">
                    <Tag className="h-3 w-3 shrink-0" />
                    <div className="flex flex-wrap gap-1 min-w-0">
                      {box.category.length > 0 ? (
                        box.category.map((item) => (
                          <span
                            key={`home-lb-${box.id}-cat-${item}`}
                            className="rounded-full border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px]"
                          >
                            {item}
                          </span>
                        ))
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                  </div>

                  {/* 설명 */}
                  <p className="mb-3 truncate text-xs text-gray-500">
                    {box.description?.trim() || "설명이 없습니다."}
                  </p>

                  {/* 참여자수 + 마감일시 */}
                  <div className="flex items-center gap-3 text-[11px] text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Users className="h-3 w-3 text-gray-400" />
                      {box.participant_streamer_ids.length}명
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock className="h-3 w-3 text-gray-400" />
                      {formatEndsAt(box.ends_at)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
