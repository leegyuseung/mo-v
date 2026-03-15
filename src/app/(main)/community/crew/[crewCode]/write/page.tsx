import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  ensureCommunityIdOnServer,
  fetchCommunityAuthContext,
  fetchEditableCommunityPostByIdOnServer,
  fetchCommunityCrewBoardMetaOnServer,
} from "@/api/community-server";
import CommunityWriteScreen from "@/components/screens/community/community-write-screen";

type CommunityCrewWritePageProps = {
  params: Promise<{
    crewCode: string;
  }>;
  searchParams?: Promise<{
    id?: string;
  }>;
};

export async function generateMetadata({
  params,
}: CommunityCrewWritePageProps): Promise<Metadata> {
  const { crewCode } = await params;
  const meta = await fetchCommunityCrewBoardMetaOnServer(crewCode);
  const entityName = meta?.entityName || "소속 커뮤니티";

  return {
    title: `${entityName} 글쓰기`,
    description: `${entityName} 커뮤니티에 새 글을 작성합니다.`,
    alternates: {
      canonical: `/community/crew/${crewCode}/write`,
    },
  };
}

export default async function CommunityCrewWritePage({
  params,
  searchParams,
}: CommunityCrewWritePageProps) {
  const { crewCode } = await params;
  const { user, canManageCommunityNoticeCategory } =
    await fetchCommunityAuthContext();

  if (!user) {
    redirect("/login");
  }

  const meta = await fetchCommunityCrewBoardMetaOnServer(crewCode);

  if (!meta) {
    notFound();
  }

  const communityId = await ensureCommunityIdOnServer(meta);
  if (!communityId) {
    notFound();
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const postId = Number(resolvedSearchParams?.id);
  let initialPost = null;

  if (Number.isInteger(postId) && postId > 0) {
    initialPost = await fetchEditableCommunityPostByIdOnServer({
      postId,
      communityId,
      viewerId: user.id,
      canManage: canManageCommunityNoticeCategory,
    });

    if (!initialPost) {
      redirect(`/community/crew/${crewCode}`);
    }
  }

  return (
    <CommunityWriteScreen
      entityType="crew"
      entityName={meta.entityName}
      entityHref={`/community/crew/${crewCode}`}
      communityId={communityId}
      canManageCommunityNoticeCategory={canManageCommunityNoticeCategory}
      initialPost={initialPost}
    />
  );
}
