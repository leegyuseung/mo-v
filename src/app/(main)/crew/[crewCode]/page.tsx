import type { Metadata } from "next";
import { cookies } from "next/headers";
import CrewDetailScreen from "@/components/screens/crew/crew-detail-screen";
import { SITE_TITLE } from "@/lib/seo";
import { createClient } from "@/utils/supabase/server";

type CrewDetailPageProps = {
  params: Promise<{
    crewCode: string;
  }>;
};

export async function generateMetadata({
  params,
}: CrewDetailPageProps): Promise<Metadata> {
  const { crewCode } = await params;
  const normalizedCode = crewCode.trim().toLowerCase();
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: crew } = await supabase
    .from("crews")
    .select("name")
    .ilike("crew_code", normalizedCode)
    .maybeSingle();
  const crewName = crew?.name || "크루";

  return {
    title: {
      absolute: SITE_TITLE,
    },
    description: `${crewName}의 정보를 한눈에 확인하세요.`,
    alternates: {
      canonical: `/crew/${crewCode}`,
    },
  };
}

export default async function CrewDetailPage({ params }: CrewDetailPageProps) {
  const { crewCode } = await params;
  return <CrewDetailScreen crewCode={crewCode} />;
}
