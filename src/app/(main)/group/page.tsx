import type { Metadata } from "next";
import GroupScreen from "@/components/screens/group/group-screen";
import { fetchMyStarredGroupIdsOnServer } from "@/api/star-server";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/group",
  },
};

export default async function GroupPage() {
  let initialStarredGroupIds: number[] = [];

  try {
    initialStarredGroupIds = await fetchMyStarredGroupIdsOnServer();
  } catch {
    initialStarredGroupIds = [];
  }

  return <GroupScreen initialStarredGroupIds={initialStarredGroupIds} />;
}
