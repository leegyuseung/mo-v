import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  fetchLiveBoxParticipantProfilesOnServer,
  fetchLiveBoxParticipantLiveStatusesOnServer,
  fetchPublicLiveBoxByIdOnServer,
} from "@/api/live-box-server";
import LiveBoxDetailScreen from "@/components/screens/live-box/live-box-detail-screen";
import { SITE_DESCRIPTION } from "@/lib/seo";
import type { LiveBox, LiveBoxParticipantProfile } from "@/types/live-box";
import type { LiveBoxDetailParticipantLiveStatus } from "@/types/live-box-screen";

type LiveBoxDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: LiveBoxDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const parsedId = Number(id);

  if (!Number.isFinite(parsedId) || parsedId <= 0) {
    return { description: SITE_DESCRIPTION };
  }

  try {
    const liveBox = await fetchPublicLiveBoxByIdOnServer(parsedId);
    const liveBoxTitle = liveBox?.title?.trim();
    const liveBoxDescription = liveBox?.description?.trim();

    return {
      title: liveBoxTitle || undefined,
      description: liveBoxDescription || SITE_DESCRIPTION,
      alternates: {
        canonical: `/live-box/${parsedId}`,
      },
    };
  } catch {
    return { description: SITE_DESCRIPTION };
  }
}

export default async function LiveBoxDetailPage({ params }: LiveBoxDetailPageProps) {
  const { id } = await params;
  const parsedId = Number(id);

  if (!Number.isFinite(parsedId) || parsedId <= 0) {
    notFound();
  }

  let liveBox: LiveBox | null = null;
  let participantProfiles: LiveBoxParticipantProfile[] = [];
  let participantLiveStatuses: LiveBoxDetailParticipantLiveStatus[] = [];
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
    participantLiveStatuses = await fetchLiveBoxParticipantLiveStatusesOnServer(
      liveBox?.participant_streamer_ids || []
    );
  } catch {
    hasLiveStreamersError = true;
  }

  return (
    <LiveBoxDetailScreen
      liveBox={liveBox}
      participantLiveStatuses={participantLiveStatuses}
      participantProfiles={participantProfiles}
      hasLiveBoxError={hasLiveBoxError}
      hasParticipantProfilesError={hasParticipantProfilesError}
      hasLiveStreamersError={hasLiveStreamersError}
    />
  );
}
