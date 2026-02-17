import type { Metadata } from "next";
import VlistDetailScreen from "@/components/screens/vlist/vlist-detail-screen";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";

type VlistDetailPageProps = {
  params: Promise<{
    publicId: string;
  }>;
};

export async function generateMetadata({
  params,
}: VlistDetailPageProps): Promise<Metadata> {
  const { publicId } = await params;

  return {
    title: {
      absolute: SITE_TITLE,
    },
    description: SITE_DESCRIPTION,
    alternates: {
      canonical: `/vlist/${publicId}`,
    },
  };
}

export default async function VlistDetailPage({ params }: VlistDetailPageProps) {
  const { publicId } = await params;
  return <VlistDetailScreen streamerPublicId={publicId} />;
}
