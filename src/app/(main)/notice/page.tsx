import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { Eye, PenSquare } from "lucide-react";
import {
  canManageNoticeOnServer,
  fetchPublishedNoticesOnServer,
} from "@/api/notice-server";
import { Button } from "@/components/ui/button";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";
import type { NoticeCategory } from "@/types/notice";

export const metadata: Metadata = {
  title: {
    absolute: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/notice",
  },
};

function getCategoryLabel(category: NoticeCategory) {
  return category === "event" ? "이벤트" : "공지";
}

function getCategoryBadgeClassName(category: NoticeCategory) {
  if (category === "event") {
    return "bg-rose-50 text-rose-700";
  }

  return "bg-blue-50 text-blue-700";
}

function formatNoticeDate(value: string | null) {
  if (!value) return "-";

  const targetDate = new Date(value);
  const now = new Date();
  const isToday =
    targetDate.getFullYear() === now.getFullYear() &&
    targetDate.getMonth() === now.getMonth() &&
    targetDate.getDate() === now.getDate();

  if (isToday) {
    return targetDate.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  const year = targetDate.getFullYear();
  const month = String(targetDate.getMonth() + 1).padStart(2, "0");
  const day = String(targetDate.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

export default async function NoticePage() {
  const cookieStore = await cookies();
  const notices = await fetchPublishedNoticesOnServer();
  const canWriteNotice = await canManageNoticeOnServer(cookieStore);

  return (
    <div className="mx-auto flex min-h-[calc(100svh-140px)] w-full max-w-5xl flex-col p-4 md:p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">공지사항</h1>
          <p className="mt-1 text-sm text-gray-500">서비스 운영 공지와 업데이트 소식을 확인할 수 있습니다.</p>
        </div>
        {canWriteNotice ? (
          <Button asChild>
            <Link href="/notice/write">
              <PenSquare className="h-4 w-4" />
              <span>글쓰기</span>
            </Link>
          </Button>
        ) : null}
      </div>

      {notices.length === 0 ? (
        <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center">
          <div>
            <p className="text-base font-medium text-gray-700">등록된 공지사항이 없습니다.</p>
            <p className="mt-2 text-sm text-gray-500">첫 공지사항을 등록해 주세요.</p>
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-600 md:grid-cols-[88px_minmax(0,1fr)_92px_88px] md:px-5">
            <span className="text-center">카테고리</span>
            <span>제목</span>
            <span className="hidden text-center md:block">날짜</span>
            <span className="hidden text-right md:block">조회수</span>
          </div>

          {notices.map((notice) => (
            <article
              key={notice.id}
              className={`grid grid-cols-[88px_minmax(0,1fr)] gap-3 border-b border-gray-100 px-4 py-4 last:border-b-0 md:grid-cols-[88px_minmax(0,1fr)_92px_88px] md:px-5 ${
                notice.is_pinned ? "bg-gray-50" : ""
              }`}
            >
              <span className="flex items-center justify-center">
                <span
                  className={`inline-flex min-w-14 items-center justify-center rounded-full px-2.5 py-1 text-xs font-semibold ${getCategoryBadgeClassName(
                    notice.category
                  )}`}
                >
                  {getCategoryLabel(notice.category)}
                </span>
              </span>
              <span
                className={`truncate text-sm text-gray-900 ${
                  notice.is_pinned ? "font-bold" : "font-medium"
                }`}
              >
                {notice.title || "(제목 없음)"}
              </span>
              <span className="hidden text-center text-sm text-gray-500 md:block">
                {formatNoticeDate(notice.published_at || notice.created_at)}
              </span>
              <span className="hidden items-center justify-end gap-1 text-sm text-gray-500 md:inline-flex">
                <Eye className="h-4 w-4" />
                {notice.view_count.toLocaleString()}
              </span>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
