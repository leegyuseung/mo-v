import type { Metadata } from "next";
import { cookies } from "next/headers";
import GroupDetailScreen from "@/components/screens/group/group-detail-screen";
import { createClient } from "@/utils/supabase/server";

type GroupDetailPageProps = {
  params: Promise<{
    groupCode: string;
  }>;
};

export async function generateMetadata({
  params,
}: GroupDetailPageProps): Promise<Metadata> {
  const { groupCode } = await params;
  const normalizedCode = groupCode.trim().toLowerCase();
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: group } = await supabase
    .from("idol_groups")
    .select("name")
    .ilike("group_code", normalizedCode)
    .maybeSingle();
  const groupName = group?.name || "그룹";

  return {
    title: groupName,
    description: `${groupName}의 정보를 한눈에 확인하세요.`,
    alternates: {
      canonical: `/group/${groupCode}`,
    },
  };
}

export default async function GroupDetailPage({ params }: GroupDetailPageProps) {
  const { groupCode } = await params;
  return <GroupDetailScreen groupCode={groupCode} />;
}
