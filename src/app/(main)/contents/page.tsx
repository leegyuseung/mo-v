import type { Metadata } from "next";
import ContentsScreen from "@/components/screens/contents/contents-screen";
import {
  fetchMyFavoriteContentIdsOnServer,
  fetchPublicContentsOnServer,
} from "@/api/contents-server";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";
import type { Content } from "@/types/content";

export const metadata: Metadata = {
  title: {
    absolute: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/contents",
  },
};

function getCurrentTimestamp() {
  return Date.now();
}

export default async function ContentsPage() {
  let contents: Content[] = [];
  let initialFavoriteContentIds: number[] = [];
  let hasContentsError = false;
  const nowTimestamp = getCurrentTimestamp();

  try {
    contents = await fetchPublicContentsOnServer();
  } catch {
    hasContentsError = true;
  }

  try {
    initialFavoriteContentIds = await fetchMyFavoriteContentIdsOnServer();
  } catch {
    initialFavoriteContentIds = [];
  }

  return (
    <ContentsScreen
      initialContents={contents}
      initialFavoriteContentIds={initialFavoriteContentIds}
      hasContentsError={hasContentsError}
      nowTimestamp={nowTimestamp}
    />
  );
}
