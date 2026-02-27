import type { Metadata } from "next";
import VlistScreen from "@/components/screens/vlist/vlist-screen";
import { fetchMyStarredStreamerIdsOnServer } from "@/api/star-server";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/vlist",
  },
};

export default async function VlistPage() {
  let initialStarredStreamerIds: number[] = [];

  try {
    initialStarredStreamerIds = await fetchMyStarredStreamerIdsOnServer();
  } catch {
    initialStarredStreamerIds = [];
  }

  return <VlistScreen initialStarredStreamerIds={initialStarredStreamerIds} />;
}
