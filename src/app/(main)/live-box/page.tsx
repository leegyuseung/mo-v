import type { Metadata } from "next";
import {
  fetchLiveBoxParticipantProfilesOnServer,
  fetchPublicLiveBoxesOnServer,
} from "@/api/live-box-server";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";
import LiveBoxScreen from "@/components/screens/live-box/live-box-screen";
import type { LiveBox, LiveBoxParticipantProfile } from "@/types/live-box";

export const metadata: Metadata = {
  title: {
    absolute: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/live-box",
  },
};

export default async function LiveBoxPage() {
  let liveBoxes: LiveBox[] = [];
  let participantProfiles: LiveBoxParticipantProfile[] = [];
  let hasLiveBoxesError = false;
  let hasParticipantProfilesError = false;

  try {
    liveBoxes = await fetchPublicLiveBoxesOnServer();
  } catch {
    hasLiveBoxesError = true;
  }

  try {
    participantProfiles = await fetchLiveBoxParticipantProfilesOnServer();
  } catch {
    hasParticipantProfilesError = true;
  }

  return (
    <LiveBoxScreen
      initialLiveBoxes={liveBoxes}
      initialParticipantProfiles={participantProfiles}
      hasLiveBoxesError={hasLiveBoxesError}
      hasParticipantProfilesError={hasParticipantProfilesError}
    />
  );
}
