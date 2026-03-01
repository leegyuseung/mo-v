import type { Metadata } from "next";
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import HomeScreen from "@/components/screens/home/home-screen";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";
import { fetchHomeShowcaseData } from "@/api/home";
import { fetchStreamerHeartLeaderboard } from "@/api/heart";
import { fetchPublicLiveBoxes } from "@/api/live-box";

export const metadata: Metadata = {
  title: {
    absolute: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
};

/**
 * 홈 페이지 서버 컴포넌트.
 * Supabase 서버 클라이언트로 주요 데이터를 프리페칭하여
 * 클라이언트 로딩 워터폴을 제거한다.
 */
export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["home", "showcase-data"],
      queryFn: () => fetchHomeShowcaseData(supabase),
    }),
    queryClient.prefetchQuery({
      queryKey: ["heart-rank-leaderboard", "all", 5],
      queryFn: () => fetchStreamerHeartLeaderboard("all", 5, supabase),
    }),
    queryClient.prefetchQuery({
      queryKey: ["heart-rank-leaderboard", "monthly", 5],
      queryFn: () => fetchStreamerHeartLeaderboard("monthly", 5, supabase),
    }),
    queryClient.prefetchQuery({
      queryKey: ["heart-rank-leaderboard", "weekly", 5],
      queryFn: () => fetchStreamerHeartLeaderboard("weekly", 5, supabase),
    }),
    queryClient.prefetchQuery({
      queryKey: ["heart-rank-leaderboard", "yearly", 5],
      queryFn: () => fetchStreamerHeartLeaderboard("yearly", 5, supabase),
    }),
    queryClient.prefetchQuery({
      queryKey: ["live-box", "list"],
      queryFn: () => fetchPublicLiveBoxes(supabase),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <HomeScreen />
    </HydrationBoundary>
  );
}
