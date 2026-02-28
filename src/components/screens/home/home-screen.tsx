"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import HomeHeartRankSection from "@/components/screens/home/home-heart-rank-section";
import HomeShowcaseSection from "@/components/screens/home/home-showcase-section";
import { Skeleton } from "@/components/ui/skeleton";
import { generateArray } from "@/utils/array";

/** 뷰포트 하단에 위치하는 섹션은 dynamic import로 코드 스플리팅한다 */
const HomeLiveStarSection = dynamic(
  () => import("@/components/screens/home/home-live-star-section"),
  {
    loading: () => (
      <section className="p-4 md:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {generateArray(2).map((_, i) => (
            <div key={`live-star-skeleton-${i}`} className="rounded-2xl border border-gray-100 bg-white p-4">
              <Skeleton className="mb-4 h-5 w-16 rounded-full" />
              <div className="grid grid-cols-4 gap-2 md:gap-3">
                {generateArray(4).map((_, j) => (
                  <div key={`live-star-slot-${i}-${j}`} className="rounded-xl p-2 text-center">
                    <Skeleton className="mx-auto mb-2 h-14 w-14 rounded-full md:h-20 md:w-20" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    ),
  }
);

const HomeLiveBoxSection = dynamic(
  () => import("@/components/screens/home/home-live-box-section"),
  {
    loading: () => (
      <section className="p-4 md:p-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-4">
          <Skeleton className="mb-4 h-5 w-20 rounded-full" />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {generateArray(3).map((_, i) => (
              <div key={`livebox-skeleton-${i}`} className="space-y-2 rounded-xl border border-gray-100 p-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </div>
      </section>
    ),
  }
);
import { useLiveStreamers } from "@/hooks/queries/live/use-live-streamers";
import { useLiveStreamerStatuses } from "@/hooks/queries/live/use-live-streamer-statuses";
import { useLiveBoxes } from "@/hooks/queries/live-box/use-live-boxes";
import { useAuthStore } from "@/store/useAuthStore";
import { useHeartLeaderboard } from "@/hooks/queries/heart/use-heart-leaderboard";
import { useStarredStreamerIds } from "@/hooks/queries/star/use-starred-streamer-ids";
import { useHomeShowcaseData } from "@/hooks/queries/home/use-home-showcase-data";
import type { HomeRankCard } from "@/types/home-screen";

const HOME_LIVE_BOX_COUNT = 3;

export default function HomeScreen() {
  const { user } = useAuthStore();
  const {
    data: showcaseData,
    isLoading: isShowcaseLoading,
    isError: isShowcaseError,
  } = useHomeShowcaseData();
  const showcaseStreamerIds = useMemo(
    () =>
      [
        ...(showcaseData?.upcomingBirthdays || []).map((streamer) => streamer.id),
        ...(showcaseData?.recommendedStreamers || []).map((streamer) => streamer.id),
      ],
    [showcaseData?.upcomingBirthdays, showcaseData?.recommendedStreamers]
  );
  const { data: liveStatusById = {} } = useLiveStreamerStatuses(showcaseStreamerIds);

  const { data: liveBoxData = [], isLoading: isLiveBoxLoading, isError: isLiveBoxError } =
    useLiveBoxes();

  const topLiveBoxes = useMemo(() => {
    return liveBoxData
      .filter((box) => box.status === "진행중")
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, HOME_LIVE_BOX_COUNT);
  }, [liveBoxData]);

  const { data: liveData, isLoading: isLiveLoading } = useLiveStreamers();
  const { data: allRank = [], isLoading: isAllRankLoading } = useHeartLeaderboard("all", 5);
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

  const rankCards: HomeRankCard[] = [
    {
      key: "all",
      title: "전체 하트 Top5",
      data: allRank,
      isLoading: isAllRankLoading,
    },
    {
      key: "monthly",
      title: "월간 하트 Top5",
      data: monthlyRank,
      isLoading: isMonthlyRankLoading,
      isError: isMonthlyRankError,
    },
    {
      key: "weekly",
      title: "주간 하트 Top5",
      data: weeklyRank,
      isLoading: isWeeklyRankLoading,
      isError: isWeeklyRankError,
    },
  ];

  const topLiveStreamers = useMemo(() => {
    return (liveData || [])
      .filter((item) => item.isLive)
      .sort((a, b) => {
        const diff = (b.viewerCount ?? 0) - (a.viewerCount ?? 0);
        if (diff !== 0) return diff;
        return (a.nickname || "").localeCompare(b.nickname || "", "ko");
      })
      .slice(0, 4);
  }, [liveData]);

  const { data: starredStreamerIds = [] } = useStarredStreamerIds(user?.id);
  const liveFavoriteStreamers = useMemo(() => {
    const idSet = new Set(starredStreamerIds);
    return (liveData || []).filter((item) => item.isLive && idSet.has(item.id));
  }, [liveData, starredStreamerIds]);

  return (
    <div className="mx-auto max-w-7xl space-y-2 p-4 md:p-6">
      <section className="mx-auto w-full max-w-[1200px]">
        <div className="flex h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center md:h-[200px]">
          <h2 className="text-lg font-semibold text-gray-800">배너 영역</h2>
          <p className="mt-2 text-sm text-gray-500">
            버츄얼 광고(생일, 앨범홍보, 컨텐츠홍보) 배너등록 준비중
          </p>
        </div>
      </section>

      <HomeHeartRankSection rankCards={rankCards} />

      <HomeShowcaseSection
        showcaseData={showcaseData}
        isShowcaseLoading={isShowcaseLoading}
        isShowcaseError={isShowcaseError}
        liveStatusById={liveStatusById}
      />

      <HomeLiveStarSection
        isLiveLoading={isLiveLoading}
        topLiveStreamers={topLiveStreamers}
        isLoggedIn={Boolean(user)}
        starredStreamerIds={starredStreamerIds}
        liveFavoriteStreamers={liveFavoriteStreamers}
      />

      <HomeLiveBoxSection
        isLiveBoxLoading={isLiveBoxLoading}
        isLiveBoxError={isLiveBoxError}
        topLiveBoxes={topLiveBoxes}
      />
    </div>
  );
}
