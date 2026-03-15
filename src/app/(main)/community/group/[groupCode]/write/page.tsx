import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  ensureCommunityIdOnServer,
  fetchCommunityAuthContext,
  fetchEditableCommunityPostByIdOnServer,
  fetchCommunityGroupBoardMetaOnServer,
} from "@/api/community-server";
import CommunityWriteScreen from "@/components/screens/community/community-write-screen";

type CommunityGroupWritePageProps = {
  params: Promise<{
    groupCode: string;
  }>;
  searchParams?: Promise<{
    id?: string;
  }>;
};

export async function generateMetadata({
  params,
}: CommunityGroupWritePageProps): Promise<Metadata> {
  const { groupCode } = await params;
  const meta = await fetchCommunityGroupBoardMetaOnServer(groupCode);
  const entityName = meta?.entityName || "그룹 커뮤니티";

  return {
    title: `${entityName} 글쓰기`,
    description: `${entityName} 커뮤니티에 새 글을 작성합니다.`,
    alternates: {
      canonical: `/community/group/${groupCode}/write`,
    },
  };
}

export default async function CommunityGroupWritePage({
  params,
  searchParams,
}: CommunityGroupWritePageProps) {
  const { groupCode } = await params;
  const { user, canManageCommunityNoticeCategory } =
    await fetchCommunityAuthContext();

  if (!user) {
    redirect("/login");
  }

  const meta = await fetchCommunityGroupBoardMetaOnServer(groupCode);

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
      redirect(`/community/group/${groupCode}`);
    }
  }

  return (
    <CommunityWriteScreen
      entityType="group"
      entityName={meta.entityName}
      entityHref={`/community/group/${groupCode}`}
      communityId={communityId}
      canManageCommunityNoticeCategory={canManageCommunityNoticeCategory}
      initialPost={initialPost}
    />
  );
}
