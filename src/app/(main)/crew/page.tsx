import type { Metadata } from "next";
import CrewScreen from "@/components/screens/crew/crew-screen";
import { fetchMyStarredCrewIdsOnServer } from "@/api/star-server";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";

export const metadata: Metadata = {
  title: {
    absolute: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/crew",
  },
};

export default async function CrewPage() {
  let initialStarredCrewIds: number[] = [];

  try {
    initialStarredCrewIds = await fetchMyStarredCrewIdsOnServer();
  } catch {
    initialStarredCrewIds = [];
  }

  return <CrewScreen initialStarredCrewIds={initialStarredCrewIds} />;
}
