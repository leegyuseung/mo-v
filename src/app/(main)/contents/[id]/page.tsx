import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  fetchIsContentFavoriteOnServer,
  fetchPublicContentByIdOnServer,
} from "@/api/contents-server";
import ContentsDetailScreen from "@/components/screens/contents/contents-detail-screen";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";

type ContentsDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function getCurrentTimestamp() {
  return Date.now();
}

export async function generateMetadata({
  params,
}: ContentsDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const parsedId = Number(id);

  if (!Number.isFinite(parsedId) || parsedId <= 0) {
    return {
      title: { absolute: SITE_TITLE },
      description: SITE_DESCRIPTION,
    };
  }

  try {
    const content = await fetchPublicContentByIdOnServer(parsedId);
    if (!content || content.status === "pending") {
      return {
        title: { absolute: SITE_TITLE },
        description: SITE_DESCRIPTION,
      };
    }

    return {
      title: {
        absolute: `${SITE_TITLE} | ${content.title}`,
      },
      description: content.description || SITE_DESCRIPTION,
      alternates: {
        canonical: `/contents/${parsedId}`,
      },
    };
  } catch {
    return {
      title: { absolute: SITE_TITLE },
      description: SITE_DESCRIPTION,
    };
  }
}

export default async function ContentsDetailPage({ params }: ContentsDetailPageProps) {
  const { id } = await params;
  const parsedId = Number(id);
  const nowTimestamp = getCurrentTimestamp();

  if (!Number.isFinite(parsedId) || parsedId <= 0) {
    notFound();
  }

  let content = null;
  let initialIsLiked = false;
  try {
    const [contentResult, isLikedResult] = await Promise.all([
      fetchPublicContentByIdOnServer(parsedId),
      fetchIsContentFavoriteOnServer(parsedId),
    ]);
    content = contentResult;
    initialIsLiked = isLikedResult;
  } catch {
    notFound();
  }

  if (!content || content.status === "pending") {
    notFound();
  }

  return (
    <ContentsDetailScreen
      content={content}
      nowTimestamp={nowTimestamp}
      initialIsLiked={initialIsLiked}
    />
  );
}
