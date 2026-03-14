import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import {
  fetchNoticeAuthContext,
  fetchPublishedNoticeByIdOnServer,
} from "@/api/notice-server";
import NoticeDetailScreen from "@/components/screens/notice/notice-detail-screen";
import { SITE_DESCRIPTION } from "@/lib/seo";
import { getNoticeDescription } from "@/utils/notice-format";

type NoticeDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: NoticeDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const parsedId = Number(id);

  if (!Number.isFinite(parsedId) || parsedId <= 0) {
    return { description: SITE_DESCRIPTION };
  }

  const notice = await fetchPublishedNoticeByIdOnServer(parsedId);
  if (!notice) {
    return { description: SITE_DESCRIPTION };
  }

  return {
    title: notice.title || "공지사항",
    description: getNoticeDescription(notice.content_html) || SITE_DESCRIPTION,
    alternates: {
      canonical: `/notice/${parsedId}`,
    },
  };
}

export default async function NoticeDetailPage({ params }: NoticeDetailPageProps) {
  const { id } = await params;
  const parsedId = Number(id);

  if (!Number.isFinite(parsedId) || parsedId <= 0) {
    notFound();
  }

  const notice = await fetchPublishedNoticeByIdOnServer(parsedId);
  if (!notice) {
    notFound();
  }

  const cookieStore = await cookies();
  const { supabase, user } = await fetchNoticeAuthContext(cookieStore);
  const isAuthor = user?.id === notice.author_id;
  let initialLiked = false;

  if (user) {
    const { data: reaction } = await supabase
      .from("notice_post_reactions")
      .select("reaction")
      .eq("notice_post_id", parsedId)
      .eq("user_id", user.id)
      .maybeSingle();

    initialLiked = reaction?.reaction === "like";
  }

  return (
    <NoticeDetailScreen
      notice={notice}
      isAuthor={isAuthor}
      initialLiked={initialLiked}
    />
  );
}
