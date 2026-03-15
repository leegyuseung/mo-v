import type { Metadata } from "next";
import {
  fetchFavoriteLatestCommunityPostsOnServer,
  fetchMyCommunityShortcutsOnServer,
  fetchPopularCommunityPostsOnServer,
  fetchTrendingCommunityPostsOnServer,
} from "@/api/community-server";
import { fetchLatestNoticeOnServer } from "@/api/notice-server";
import CommunityHubScreen from "@/components/screens/community/community-hub-screen";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/community",
  },
};

export default async function CommunityPage() {
  const [latestNotice, communityShortcuts, favoriteLatestPosts, popularPosts, trendingPosts] = await Promise.all([
    fetchLatestNoticeOnServer(),
    fetchMyCommunityShortcutsOnServer(),
    fetchFavoriteLatestCommunityPostsOnServer(),
    fetchPopularCommunityPostsOnServer(),
    fetchTrendingCommunityPostsOnServer(),
  ]);

  return (
    <CommunityHubScreen
      latestNotice={latestNotice}
      communityShortcuts={communityShortcuts}
      favoriteLatestPosts={favoriteLatestPosts}
      popularPosts={popularPosts}
      trendingPosts={trendingPosts}
    />
  );
}
