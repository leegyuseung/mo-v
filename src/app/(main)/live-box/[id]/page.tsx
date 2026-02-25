import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  fetchLiveBoxParticipantProfilesOnServer,
  fetchLiveStreamersOnServer,
  fetchPublicLiveBoxByIdOnServer,
} from "@/api/live-box-server";
import LiveBoxDetailScreen from "@/components/screens/live-box/live-box-detail-screen";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";
import type { LiveStreamer } from "@/types/live";
import type { LiveBox, LiveBoxParticipantProfile } from "@/types/live-box";

type LiveBoxDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const metadata: Metadata = {
  title: {
    absolute: SITE_TITLE,
  },
  description: SITE_DESCRIPTION,
};

export default async function LiveBoxDetailPage({ params }: LiveBoxDetailPageProps) {
  const { id } = await params;
  const parsedId = Number(id);

  if (!Number.isFinite(parsedId) || parsedId <= 0) {
    notFound();
  }

  let liveBox: LiveBox | null = null;
  let participantProfiles: LiveBoxParticipantProfile[] = [];
  let liveStreamers: LiveStreamer[] = [];
  let hasLiveBoxError = false;
  let hasParticipantProfilesError = false;
  let hasLiveStreamersError = false;

  try {
    liveBox = await fetchPublicLiveBoxByIdOnServer(parsedId);
  } catch {
    hasLiveBoxError = true;
  }

  if (!liveBox && !hasLiveBoxError) {
    notFound();
  }

  try {
    participantProfiles = await fetchLiveBoxParticipantProfilesOnServer();
  } catch {
    hasParticipantProfilesError = true;
  }

  try {
    liveStreamers = await fetchLiveStreamersOnServer();
  } catch {
    hasLiveStreamersError = true;
  }

  return (
    <LiveBoxDetailScreen
      liveBox={liveBox}
      liveStreamers={liveStreamers}
      participantProfiles={participantProfiles}
      hasLiveBoxError={hasLiveBoxError}
      hasParticipantProfilesError={hasParticipantProfilesError}
      hasLiveStreamersError={hasLiveStreamersError}
    />
  );
}
