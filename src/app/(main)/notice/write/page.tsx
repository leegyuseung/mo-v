import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  fetchNoticeAuthContext,
  fetchPublishedNoticeByIdOnServer,
} from "@/api/notice-server";
import NoticeWriteScreen from "@/components/screens/notice/notice-write-screen";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";
import { isAdminRole } from "@/utils/role";

export const metadata: Metadata = {
  title: {
    absolute: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/notice/write",
  },
};

type NoticeWritePageProps = {
  searchParams?: Promise<{
    id?: string;
  }>;
};

export default async function NoticeWritePage({ searchParams }: NoticeWritePageProps) {
  const cookieStore = await cookies();
  const { user, role } = await fetchNoticeAuthContext(cookieStore);
  const canWriteNotice = isAdminRole(role);

  if (!canWriteNotice || !user) {
    redirect("/notice");
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const noticeId = Number(resolvedSearchParams?.id);

  if (Number.isInteger(noticeId) && noticeId > 0) {
    const notice = await fetchPublishedNoticeByIdOnServer(noticeId);

    if (!notice || notice.author_id !== user.id) {
      redirect("/notice");
    }

    return <NoticeWriteScreen initialNotice={notice} />;
  }

  return <NoticeWriteScreen />;
}
