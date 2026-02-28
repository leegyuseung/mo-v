"use client";

import { useMemo } from "react";
import HomeHeartRankSection from "@/components/screens/home/home-heart-rank-section";
import HomeLiveBoxSection from "@/components/screens/home/home-live-box-section";
import HomeLiveStarSection from "@/components/screens/home/home-live-star-section";
import HomeShowcaseSection from "@/components/screens/home/home-showcase-section";
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
