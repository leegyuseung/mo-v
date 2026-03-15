import Link from "next/link";
import { Eye, Heart } from "lucide-react";
import type { CommunityHubPostItem } from "@/types/community";
import { formatCommunityListDate } from "@/utils/community-format";

type CommunityPostsSectionProps = {
  title: string;
  items: CommunityHubPostItem[];
  emptyMessage: string;
};

export default function CommunityPostsSection({
  title,
  items,
  emptyMessage,
}: CommunityPostsSectionProps) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {items.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-gray-400">
            {emptyMessage}
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={item.id}
              className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0"
            >
              <span className="shrink-0 text-sm font-semibold text-gray-400">
                {index + 1}
              </span>
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <Link
                  href={item.communityHref}
                  className="shrink-0 max-w-[120px] truncate text-xs text-gray-500 hover:text-gray-700 sm:max-w-[180px] sm:text-sm"
                >
                  {item.communityName}
                </Link>
                <Link
                  href={item.href}
                  className="min-w-0 flex-1 truncate text-sm font-medium text-gray-900 hover:text-gray-700"
                >
                  {item.title}
                </Link>
              </div>
              <div className="shrink-0 text-right text-xs text-gray-500">
                <div className="flex items-center justify-end gap-2 sm:gap-3">
                  <span className="inline-flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" />
                    {item.likeCount.toLocaleString()}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {item.viewCount.toLocaleString()}
                  </span>
                  {/* 모바일에서는 날짜 숨김 - 좁은 화면에서 overflow 방지 */}
                  <span className="hidden sm:inline">{formatCommunityListDate(item.publishedAt || item.createdAt)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
