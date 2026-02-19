import type { Metadata } from "next";
import CrewDetailScreen from "@/components/screens/crew/crew-detail-screen";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";

type CrewDetailPageProps = {
  params: Promise<{
    crewCode: string;
  }>;
};

export async function generateMetadata({
  params,
}: CrewDetailPageProps): Promise<Metadata> {
  const { crewCode } = await params;

  return {
    title: {
      absolute: SITE_TITLE,
    },
    description: SITE_DESCRIPTION,
    alternates: {
      canonical: `/crew/${crewCode}`,
    },
  };
}

export default async function CrewDetailPage({ params }: CrewDetailPageProps) {
  const { crewCode } = await params;
  return <CrewDetailScreen crewCode={crewCode} />;
}
