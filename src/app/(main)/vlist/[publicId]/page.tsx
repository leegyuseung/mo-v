import VlistDetailScreen from "@/components/screens/vlist/vlist-detail-screen";

type VlistDetailPageProps = {
  params: Promise<{
    publicId: string;
  }>;
};

export default async function VlistDetailPage({ params }: VlistDetailPageProps) {
  const { publicId } = await params;
  return <VlistDetailScreen streamerPublicId={publicId} />;
}
