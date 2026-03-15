import Link from "next/link";
import { Gem, MicVocal, UsersRound } from "lucide-react";
import CommunityDirectoryCard from "@/components/screens/community/community-directory-card";
import CommunityPostsSection from "@/components/screens/community/community-posts-section";
import CommunitySearchPanel from "@/components/screens/community/community-search-panel";
import CommunityShortcutsSection from "@/components/screens/community/community-shortcuts-section";
import type { NoticePost } from "@/types/notice";
import type {
  CommunityHubPostItem,
  CommunityShortcutItem,
} from "@/types/community";
import {
  getNoticeCategoryBadgeClassName,
  getNoticeCategoryLabel,
} from "@/utils/notice-format";
const COMMUNITY_DIRECTORIES = [
  {
    href: "/community/vlist",
    title: "버츄얼 커뮤니티",
    icon: Gem,
  },
  {
    href: "/community/group",
    title: "그룹 커뮤니티",
    icon: MicVocal,
  },
  {
    href: "/community/crew",
    title: "크루 커뮤니티",
    icon: UsersRound,
  },
] as const;

type CommunityHubScreenProps = {
  latestNotice: NoticePost | null;
  communityShortcuts: CommunityShortcutItem[];
  favoriteLatestPosts: CommunityHubPostItem[];
  popularPosts: CommunityHubPostItem[];
  trendingPosts: CommunityHubPostItem[];
};

function formatLatestNoticeDate(dateString: string | null) {
  if (!dateString) return "";

  return new Date(dateString).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
}

export default function CommunityHubScreen({
  latestNotice,
  communityShortcuts,
  favoriteLatestPosts,
  popularPosts,
  trendingPosts,
}: CommunityHubScreenProps) {
  return (
    <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 p-4 md:p-6">
      <CommunitySearchPanel />

      {latestNotice ? (
        <Link
          href={`/notice/${latestNotice.id}`}
          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
        >
          <span className="shrink-0 text-xs font-semibold text-gray-500">
            공지사항
          </span>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${getNoticeCategoryBadgeClassName(
              latestNotice.category
            )}`}
          >
            {getNoticeCategoryLabel(latestNotice.category)}
          </span>
          <span className="min-w-0 flex-1 truncate font-medium text-gray-900">
            {latestNotice.title}
          </span>
          <span className="shrink-0 text-xs text-gray-400">
            {formatLatestNoticeDate(latestNotice.published_at)}
          </span>
        </Link>
      ) : null}

      <section className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {COMMUNITY_DIRECTORIES.map((directory) => (
            <CommunityDirectoryCard
              key={directory.href}
              href={directory.href}
              title={directory.title}
              icon={directory.icon}
            />
          ))}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <CommunityPostsSection
          title="🔥 급상승"
          items={trendingPosts}
          emptyMessage="최근 1시간 기준 급상승 글이 아직 없습니다."
        />
        <CommunityPostsSection
          title="❤️ 인기글"
          items={popularPosts}
          emptyMessage="최근 24시간 기준 인기글이 아직 없습니다."
        />
      </div>

      <CommunityShortcutsSection
        communityShortcuts={communityShortcuts}
        favoriteLatestPosts={favoriteLatestPosts}
      />
    </div>
  );
}
