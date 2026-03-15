import Image from "next/image";
import Link from "next/link";
import { PenSquare, UserRound } from "lucide-react";
import PageBreadcrumb from "@/components/common/page-breadcrumb";
import CommunityListControls from "@/components/screens/community/community-list-controls";
import CommunityPaginationControls from "@/components/screens/community/community-pagination-controls";
import { Button } from "@/components/ui/button";
import { shouldBypassNextImageOptimization } from "@/utils/image";
import {
  formatCommunityListDate,
  formatCommunityViewCount,
  getCommunityCategoryBadgeClassName,
  getCommunityCategoryLabel,
} from "@/utils/community-format";
import type {
  CommunityBoardMeta,
  CommunityBoardPost,
  CommunityPostSearchField,
} from "@/types/community";

type CommunityBoardScreenProps = {
  meta: CommunityBoardMeta;
  posts: CommunityBoardPost[];
  totalCount: number;
  page: number;
  totalPages: number;
  keyword: string;
  searchField: CommunityPostSearchField;
  canWrite: boolean;
};

export default function CommunityBoardScreen({
  meta,
  posts,
  totalCount,
  page,
  totalPages,
  keyword,
  searchField,
  canWrite,
}: CommunityBoardScreenProps) {
  const sectionLabel =
    meta.entityType === "vlist"
      ? "버츄얼"
      : meta.entityType === "group"
        ? "그룹"
        : "소속";
  const sectionHref =
    meta.entityType === "vlist"
      ? "/community/vlist"
      : meta.entityType === "group"
        ? "/community/group"
        : "/community/crew";
  const writeHref =
    meta.entityType === "vlist"
      ? `/community/vlist/${meta.entityPublicId}/write`
      : meta.entityType === "group"
        ? `/community/group/${meta.entityPublicId}/write`
        : `/community/crew/${meta.entityPublicId}/write`;
  const detailBaseHref =
    meta.entityType === "vlist"
      ? `/community/vlist/${meta.entityPublicId}`
      : meta.entityType === "group"
        ? `/community/group/${meta.entityPublicId}`
        : `/community/crew/${meta.entityPublicId}`;

  return (
    <div className="mx-auto flex min-h-[calc(100svh-140px)] w-full max-w-[1440px] flex-col p-4 md:px-8 md:py-6">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <PageBreadcrumb
            items={[
              { label: "커뮤니티", href: "/community" },
              { label: sectionLabel, href: sectionHref },
              { label: meta.entityName },
            ]}
          />
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
              {meta.imageUrl ? (
                <Image
                  src={meta.imageUrl}
                  alt={meta.entityName}
                  width={48}
                  height={48}
                  className="h-12 w-12 object-cover"
                  unoptimized={shouldBypassNextImageOptimization(meta.imageUrl)}
                />
              ) : (
                <UserRound className="h-6 w-6 text-gray-300" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold text-gray-900">
                {meta.entityName} 커뮤니티
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {meta.entityName} 관련 게시글을 확인할 수 있습니다.
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 md:w-auto md:items-end">
          <CommunityListControls
            initialKeyword={keyword}
            initialSearchField={searchField}
            placeholder={`${meta.entityName} 커뮤니티 글을 검색해 주세요`}
          />
          {canWrite ? (
            <Button asChild className="md:self-end">
              <Link href={writeHref}>
                <PenSquare className="h-4 w-4" />
                <span>글쓰기</span>
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <div className="mb-3 text-sm text-gray-500">
        총 {totalCount.toLocaleString()}개
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="grid grid-cols-[minmax(0,1fr)] gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 md:grid-cols-[104px_minmax(0,1fr)_180px_100px_88px_88px] md:px-6">
          <span className="hidden text-center md:block">카테고리</span>
          <span>제목</span>
          <span className="hidden md:block">작성자</span>
          <span className="hidden text-center md:block">작성일</span>
          <span className="hidden text-center md:block">좋아요</span>
          <span className="hidden text-center md:block">조회수</span>
        </div>

        {posts.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-base font-medium text-gray-700">
              {keyword ? "검색 결과가 없습니다." : "등록된 게시글이 없습니다."}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              {keyword
                ? "다른 검색어 또는 검색 조건으로 다시 시도해 주세요."
                : "첫 게시글이 등록되면 이곳에 표시됩니다."}
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <Link
              key={post.id}
              href={`${detailBaseHref}/${post.id}`}
              id={`community-post-${post.id}`}
              className={`grid grid-cols-[minmax(0,1fr)] gap-3 border-b border-gray-100 px-4 py-4 transition-colors hover:bg-gray-50 last:border-b-0 md:grid-cols-[104px_minmax(0,1fr)_180px_100px_88px_88px] md:px-6 ${
                post.is_pinned ? "bg-gray-50" : ""
              }`}
            >
              <span className="hidden items-center justify-center md:flex">
                <span
                  className={`inline-flex shrink-0 items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${getCommunityCategoryBadgeClassName(
                    post.category
                  )}`}
                >
                  {getCommunityCategoryLabel(post.category)}
                </span>
              </span>
              <span className="flex min-w-0 items-center gap-2">
                <span
                  className={`inline-flex shrink-0 items-center justify-center rounded-full px-2.5 py-1 text-[11px] font-semibold md:hidden ${getCommunityCategoryBadgeClassName(
                    post.category
                  )}`}
                >
                  {getCommunityCategoryLabel(post.category)}
                </span>
                <span
                  className={`min-w-0 truncate text-sm text-gray-900 ${
                    post.is_pinned ? "font-bold" : "font-medium"
                  }`}
                >
                  {post.title || "(제목 없음)"}
                </span>
              </span>
              <span className="hidden min-w-0 items-center gap-2 overflow-hidden md:flex">
                {post.author_profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.author_profile.avatar_url}
                    alt={post.author_profile.nickname || "작성자"}
                    className="h-7 w-7 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                    <UserRound className="h-4 w-4" />
                  </span>
                )}
                <span className="truncate text-xs text-gray-600">
                  {post.author_profile?.nickname || "사용자"}
                </span>
              </span>
              <span className="hidden text-center text-sm text-gray-500 md:block">
                {formatCommunityListDate(post.published_at || post.created_at)}
              </span>
              <span className="hidden justify-center text-sm text-gray-500 md:inline-flex">
                {post.like_count.toLocaleString()}
              </span>
              <span className="hidden justify-center text-sm text-gray-500 md:inline-flex">
                {formatCommunityViewCount(post.view_count)}
              </span>
            </Link>
          ))
        )}
      </div>

      <CommunityPaginationControls page={page} totalPages={totalPages} />
    </div>
  );
}
