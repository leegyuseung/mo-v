import VlistDetailScreen from "@/components/screens/vlist/vlist-detail-screen";

type VlistDetailPageProps = {
  params: {
    id: string;
  };
};

export default function VlistDetailPage({ params }: VlistDetailPageProps) {
  const streamerId = Number(params.id);
  return <VlistDetailScreen streamerId={streamerId} />;
}
