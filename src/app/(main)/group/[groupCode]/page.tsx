import type { Metadata } from "next";
import GroupDetailScreen from "@/components/screens/group/group-detail-screen";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";

type GroupDetailPageProps = {
  params: Promise<{
    groupCode: string;
  }>;
};

export async function generateMetadata({
  params,
}: GroupDetailPageProps): Promise<Metadata> {
  const { groupCode } = await params;

  return {
    title: {
      absolute: SITE_TITLE,
    },
    description: SITE_DESCRIPTION,
    alternates: {
      canonical: `/group/${groupCode}`,
    },
  };
}

export default async function GroupDetailPage({ params }: GroupDetailPageProps) {
  const { groupCode } = await params;
  return <GroupDetailScreen groupCode={groupCode} />;
}
