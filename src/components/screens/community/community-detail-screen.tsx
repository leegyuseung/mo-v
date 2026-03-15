import Link from "next/link";
import { ArrowBigLeft, Eye, UserRound } from "lucide-react";
import UserProfileMenuTrigger from "@/components/common/user-profile-menu-trigger";
import PostDetailCommentPlaceholder from "@/components/common/post-detail-comment-placeholder";
import CommunityDetailActions from "@/components/screens/community/community-detail-actions";
import CommunityDetailLikeButton from "@/components/screens/community/community-detail-like-button";
import CommunityDetailViewCount from "@/components/screens/community/community-detail-view-count";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { CommunityPost, CommunitySearchEntityType } from "@/types/community";
import {
  formatCommunityDateTime,
  getCommunityCategoryBadgeClassName,
  getCommunityCategoryLabel,
} from "@/utils/community-format";

type CommunityDetailScreenProps = {
  post: CommunityPost;
  isLoggedIn: boolean;
  isAuthor: boolean;
  canManage: boolean;
  initialLiked: boolean;
  entityType: CommunitySearchEntityType;
  entityPublicId: string;
};

export default function CommunityDetailScreen({
  post,
  isLoggedIn,
  isAuthor,
  canManage,
  initialLiked,
  entityType,
  entityPublicId,
}: CommunityDetailScreenProps) {
  const backHref =
    entityType === "vlist"
      ? `/community/vlist/${entityPublicId}`
      : entityType === "group"
        ? `/community/group/${entityPublicId}`
        : `/community/crew/${entityPublicId}`;
  const editHref = `${backHref}/write?id=${post.id}`;
  const authorMeta = (
    <div className="min-w-0">
      <p className="truncate text-base font-semibold text-gray-900">
        {post.author_profile?.nickname || "사용자"}
      </p>
      <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-gray-500">
        <span>{formatCommunityDateTime(post.published_at || post.created_at)}</span>
        <span className="inline-flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" />
          <CommunityDetailViewCount
            postId={post.id}
            initialViewCount={post.view_count}
          />
        </span>
      </div>
    </div>
  );

  const authorAvatar = post.author_profile?.avatar_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={post.author_profile.avatar_url}
      alt={post.author_profile.nickname || "작성자"}
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
              href={backHref}
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              aria-label="커뮤니티 목록으로"
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
              className={`inline-flex min-w-14 items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${getCommunityCategoryBadgeClassName(
                post.category
              )}`}
            >
              {getCommunityCategoryLabel(post.category)}
            </span>
            <h1 className="text-xl font-bold text-gray-900 md:text-2xl">
              {post.title || "(제목 없음)"}
            </h1>
          </div>

          <div className="mt-4 flex items-start justify-between gap-4">
            <UserProfileMenuTrigger
              userPublicId={post.author_profile?.public_id ?? null}
              ariaLabel="작성자 메뉴 열기"
              className="flex min-w-0 cursor-pointer items-center gap-2.5 rounded-lg text-left transition-opacity hover:opacity-80"
            >
              {authorAvatar}
              {authorMeta}
            </UserProfileMenuTrigger>

            <CommunityDetailActions
              postId={post.id}
              isLoggedIn={isLoggedIn}
              isAuthor={isAuthor}
              canManage={canManage}
              editHref={editHref}
              backHref={backHref}
            />
          </div>
        </header>

        <div className="px-5 py-6 md:px-6">
          <div
            className="min-h-60 text-sm leading-7 text-gray-900 [&_a]:text-blue-600 [&_a]:underline [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-gray-200 [&_blockquote]:pl-4 [&_img]:my-4 [&_img]:max-h-[640px] [&_img]:rounded-xl [&_img]:object-contain [&_ol]:list-decimal [&_ol]:pl-5 [&_table]:my-4 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-gray-300 [&_td]:p-2 [&_th]:border [&_th]:border-gray-300 [&_th]:bg-gray-50 [&_th]:p-2 [&_ul]:list-disc [&_ul]:pl-5"
            dangerouslySetInnerHTML={{ __html: post.content_html }}
          />

          <div className="mt-8 flex items-center">
            <CommunityDetailLikeButton
              postId={post.id}
              initialLikeCount={post.like_count}
              initialLiked={initialLiked}
            />
          </div>

          <PostDetailCommentPlaceholder message="커뮤니티 댓글 기능은 준비 중입니다." />
        </div>
      </article>
    </div>
  );
}
