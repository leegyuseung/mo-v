import Link from "next/link";
import { ArrowBigLeft, Eye, UserRound } from "lucide-react";
import UserProfileMenuTrigger from "@/components/common/user-profile-menu-trigger";
import NoticeDetailActions from "@/components/screens/notice/notice-detail-actions";
import NoticeDetailCommentSection from "@/components/screens/notice/notice-detail-comment-section";
import NoticeDetailLikeButton from "@/components/screens/notice/notice-detail-like-button";
import NoticeDetailViewCount from "@/components/screens/notice/notice-detail-view-count";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { NoticePost } from "@/types/notice";
import {
  formatNoticeDateTime,
  getNoticeCategoryBadgeClassName,
  getNoticeCategoryLabel,
} from "@/utils/notice-format";

type NoticeDetailScreenProps = {
  notice: NoticePost;
  isAuthor: boolean;
  initialLiked: boolean;
};

export default function NoticeDetailScreen({
  notice,
  isAuthor,
  initialLiked,
}: NoticeDetailScreenProps) {
  const authorMeta = (
    <div className="min-w-0">
      <p className="truncate text-base font-semibold text-gray-900">
        {notice.author_profile?.nickname || "운영자"}
      </p>
      <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-gray-500">
        <span>{formatNoticeDateTime(notice.published_at || notice.created_at)}</span>
        <span className="inline-flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" />
          <NoticeDetailViewCount
            noticeId={notice.id}
            initialViewCount={notice.view_count}
          />
        </span>
      </div>
    </div>
  );

  const authorAvatar = notice.author_profile?.avatar_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={notice.author_profile.avatar_url}
      alt={notice.author_profile.nickname || "작성자"}
      className="h-11 w-11 shrink-0 rounded-full object-cover"
    />
  ) : (
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-500">
      <UserRound className="h-5.5 w-5.5" />
    </span>
  );

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:px-8 md:py-6">
      <div className="mb-4 flex items-center justify-between">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              href="/notice"
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              aria-label="공지사항 목록으로"
            >
              <ArrowBigLeft className="h-4 w-4" />
            </Link>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>뒤로가기</TooltipContent>
        </Tooltip>
      </div>

      <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <header className="border-b border-gray-200 px-5 py-5 md:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`inline-flex min-w-14 items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${getNoticeCategoryBadgeClassName(
                notice.category
              )}`}
            >
              {getNoticeCategoryLabel(notice.category)}
            </span>
            <h1 className="text-xl font-bold text-gray-900 md:text-2xl">
              {notice.title || "(제목 없음)"}
            </h1>
          </div>

          <div className="mt-4 flex items-start justify-between gap-4">
            <UserProfileMenuTrigger
              userPublicId={notice.author_profile?.public_id ?? null}
              ariaLabel="작성자 메뉴 열기"
              className="flex min-w-0 cursor-pointer items-center gap-2.5 rounded-lg text-left transition-opacity hover:opacity-80"
            >
              {authorAvatar}
              {authorMeta}
            </UserProfileMenuTrigger>

            <NoticeDetailActions noticeId={notice.id} isAuthor={isAuthor} />
          </div>
        </header>

        <div className="px-5 py-6 md:px-6">
          <div
            className="min-h-60 text-sm leading-7 text-gray-900 [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-200 [&_blockquote]:pl-4 [&_img]:my-4 [&_img]:max-h-[640px] [&_img]:rounded-xl [&_img]:object-contain [&_ol]:list-decimal [&_ol]:pl-5 [&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-gray-300 [&_td]:p-2 [&_th]:border [&_th]:border-gray-300 [&_th]:bg-gray-50 [&_th]:p-2 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: notice.content_html }}
          />

          <div className="mt-8 flex items-center">
            <NoticeDetailLikeButton
              noticeId={notice.id}
              initialLikeCount={notice.like_count}
              initialLiked={initialLiked}
            />
          </div>

          <NoticeDetailCommentSection />
        </div>
      </article>
    </div>
  );
}
