import type { Metadata } from "next";
import { cookies } from "next/headers";
import VlistDetailScreen from "@/components/screens/vlist/vlist-detail-screen";
import { SITE_TITLE } from "@/lib/seo";
import { createClient } from "@/utils/supabase/server";

type VlistDetailPageProps = {
  params: Promise<{
    publicId: string;
  }>;
};

export async function generateMetadata({
  params,
}: VlistDetailPageProps): Promise<Metadata> {
  const { publicId } = await params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: streamer } = await supabase
    .from("streamers")
    .select("nickname")
    .eq("public_id", publicId)
    .maybeSingle();
  const streamerName = streamer?.nickname || "버츄얼";

  return {
    title: {
      absolute: `${SITE_TITLE} | ${streamerName}`,
    },
    description: `${streamerName}의 정보를 한눈에 확인하세요.`,
    alternates: {
      canonical: `/vlist/${publicId}`,
    },
  };
}

export default async function VlistDetailPage({ params }: VlistDetailPageProps) {
  const { publicId } = await params;
  return <VlistDetailScreen streamerPublicId={publicId} />;
}
