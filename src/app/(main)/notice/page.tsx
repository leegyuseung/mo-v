import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { PenSquare, UserRound } from "lucide-react";
import {
  canManageNoticeOnServer,
  fetchPublishedNoticesOnServer,
} from "@/api/notice-server";
import { Button } from "@/components/ui/button";
import NoticeListControls from "@/components/screens/notice/notice-list-controls";
import NoticePaginationControls from "@/components/screens/notice/notice-pagination-controls";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";
import type { NoticeSearchField } from "@/types/notice";
import {
  formatNoticeListDate,
  formatNoticeViewCount,
  getNoticeCategoryBadgeClassName,
  getNoticeCategoryLabel,
} from "@/utils/notice-format";

const NOTICE_PAGE_SIZE = 20;

type NoticePageProps = {
  searchParams?: Promise<{
    page?: string;
    q?: string;
    filter?: string;
  }>;
};

function toSafePage(value?: string) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return 1;
  return parsed;
}

function toSearchField(value?: string): NoticeSearchField {
  if (value === "title" || value === "content") return value;
  return "title_content";
}

export const metadata: Metadata = {
  title: {
    absolute: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/notice",
  },
};

export default async function NoticePage({ searchParams }: NoticePageProps) {
  const cookieStore = await cookies();
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const page = toSafePage(resolvedSearchParams?.page);
  const keyword = resolvedSearchParams?.q?.trim() || "";
  const searchField = toSearchField(resolvedSearchParams?.filter);
  const noticeList = await fetchPublishedNoticesOnServer({
    page,
    pageSize: NOTICE_PAGE_SIZE,
    keyword,
    searchField,
  });
  const notices = noticeList.items;
  const canWriteNotice = await canManageNoticeOnServer(cookieStore);
  const totalPages = Math.max(1, Math.ceil(noticeList.totalCount / NOTICE_PAGE_SIZE));

  return (
    <div className="mx-auto flex min-h-[calc(100svh-140px)] w-full max-w-6xl flex-col p-4 md:px-8 md:py-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">공지사항</h1>
          <p className="mt-1 text-sm text-gray-500">서비스 운영 공지와 업데이트 소식을 확인할 수 있습니다.</p>
        </div>
        <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
          <NoticeListControls
            initialKeyword={keyword}
            initialSearchField={searchField}
          />
          {canWriteNotice ? (
            <Button asChild>
              <Link href="/notice/write">
                <PenSquare className="h-4 w-4" />
                <span>글쓰기</span>
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      {notices.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
          <div>
            <p className="text-base font-medium text-gray-700">
              {keyword ? "검색 결과가 없습니다." : "등록된 공지사항이 없습니다."}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              {keyword ? "다른 검색어 또는 검색 조건으로 다시 시도해 주세요." : "첫 공지사항을 등록해 주세요."}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-3 text-sm text-gray-500">
            총 {noticeList.totalCount.toLocaleString()}개
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 md:grid-cols-[88px_minmax(0,1fr)_180px_100px_88px] md:px-6">
              <span className="text-center">카테고리</span>
              <span>제목</span>
              <span className="hidden md:block">작성자</span>
              <span className="hidden text-center md:block">작성일</span>
              <span className="hidden text-center md:block">조회수</span>
            </div>

            {notices.map((notice) => (
              <Link
                key={notice.id}
                href={`/notice/${notice.id}`}
                className={`grid cursor-pointer grid-cols-[88px_minmax(0,1fr)] gap-3 border-b border-gray-100 px-4 py-4 transition-colors hover:bg-gray-50 last:border-b-0 md:grid-cols-[88px_minmax(0,1fr)_180px_100px_88px] md:px-6 ${
                  notice.is_pinned ? "bg-gray-50" : ""
                }`}
              >
                <span className="flex items-center justify-center">
                  <span
                    className={`inline-flex min-w-14 items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${getNoticeCategoryBadgeClassName(
                      notice.category
                    )}`}
                  >
                    {getNoticeCategoryLabel(notice.category)}
                  </span>
                </span>
                <span
                  className={`min-w-0 truncate text-sm text-gray-900 ${
                    notice.is_pinned ? "font-bold" : "font-medium"
                  }`}
                >
                  {notice.title || "(제목 없음)"}
                </span>
                <span className="hidden min-w-0 items-center gap-2 overflow-hidden md:flex">
                  {notice.author_profile?.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={notice.author_profile.avatar_url}
                      alt={notice.author_profile.nickname || "작성자"}
                      className="h-7 w-7 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                      <UserRound className="h-4 w-4" />
                    </span>
                  )}
                  <span className="truncate text-xs text-gray-600">
                    {notice.author_profile?.nickname || "운영자"}
                  </span>
                </span>
                <span className="hidden text-center text-sm text-gray-500 md:block">
                  {formatNoticeListDate(notice.published_at || notice.created_at)}
                </span>
                <span className="hidden justify-center text-sm text-gray-500 md:inline-flex">
                  {formatNoticeViewCount(notice.view_count)}
                </span>
              </Link>
            ))}
          </div>

          <NoticePaginationControls page={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
