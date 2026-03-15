"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronDown,
  Clock3,
  MicVocal,
  Star,
  UserRound,
  UsersRound,
} from "lucide-react";
import type {
  CommunityHubPostItem,
  CommunityShortcutItem,
} from "@/types/community";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  formatCommunityListDate,
  getCommunityCategoryBadgeClassName,
  getCommunityCategoryLabel,
} from "@/utils/community-format";

const COMMUNITY_SHORTCUT_GROUPS = [
  {
    type: "vlist",
    title: "버츄얼",
  },
  {
    type: "group",
    title: "그룹",
  },
  {
    type: "crew",
    title: "소속",
  },
] as const;

type CommunityShortcutsSectionProps = {
  communityShortcuts: CommunityShortcutItem[];
  favoriteLatestPosts: CommunityHubPostItem[];
};

export default function CommunityShortcutsSection({
  communityShortcuts,
  favoriteLatestPosts,
}: CommunityShortcutsSectionProps) {
  const [isOpen, setIsOpen] = useState(true);

  const shortcutGroups = COMMUNITY_SHORTCUT_GROUPS.map((group) => ({
    ...group,
    items: communityShortcuts.filter((item) => item.type === group.type),
  })).filter((group) => group.items.length > 0);

  return (
    <section className="space-y-3">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-900"
      >
        <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
        <span>즐겨찾기</span>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen ? (
        <div className="space-y-3">
          {shortcutGroups.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-6 text-sm text-gray-400">
              즐겨찾기한 커뮤니티가 아직 없습니다.
            </div>
          ) : (
            shortcutGroups.map((group) => (
              <div key={group.type} className="flex items-start gap-4">
                <span className="w-10 shrink-0 pt-2 text-sm font-medium text-gray-500">
                  {group.title}
                </span>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white transition-colors hover:border-gray-300 hover:bg-gray-50"
                        >
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          ) : item.type === "vlist" ? (
                            <UserRound className="h-5 w-5 text-gray-400" />
                          ) : item.type === "group" ? (
                            <MicVocal className="h-5 w-5 text-gray-400" />
                          ) : (
                            <UsersRound className="h-5 w-5 text-gray-400" />
                          )}
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={6}>
                        {item.name}
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            ))
          )}

          <div className="rounded-2xl border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-900">
              <Clock3 className="h-4 w-4 text-gray-500" />
              <span>즐겨찾기 최신글</span>
            </div>
            {favoriteLatestPosts.length === 0 ? (
              <p className="text-sm text-gray-400">
                즐겨찾기 커뮤니티의 최신글이 아직 없습니다.
              </p>
            ) : (
              <div className="space-y-2">
                {favoriteLatestPosts.map((post) => (
                  <Link
                    key={`favorite-latest-${post.id}`}
                    href={post.href}
                    className="flex items-center gap-3 rounded-xl px-3 py-2 transition-colors hover:bg-gray-50"
                  >
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900">
                      <span className="mr-2 text-xs font-medium text-gray-500">
                        {post.communityName}
                      </span>
                      <span
                        className={`mr-2 inline-flex shrink-0 items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${getCommunityCategoryBadgeClassName(
                          post.category
                        )}`}
                      >
                        {getCommunityCategoryLabel(post.category)}
                      </span>
                      {post.title}
                    </span>
                    <span className="shrink-0 text-xs text-gray-400">
                      {formatCommunityListDate(post.publishedAt || post.createdAt)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
