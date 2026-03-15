import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import {
  ensureCommunityIdOnServer,
  fetchCommunityAuthContext,
  fetchEditableCommunityPostByIdOnServer,
  fetchCommunityVlistBoardMetaOnServer,
} from "@/api/community-server";
import CommunityWriteScreen from "@/components/screens/community/community-write-screen";

type CommunityVlistWritePageProps = {
  params: Promise<{
    publicId: string;
  }>;
  searchParams?: Promise<{
    id?: string;
  }>;
};

export async function generateMetadata({
  params,
}: CommunityVlistWritePageProps): Promise<Metadata> {
  const { publicId } = await params;
  const meta = await fetchCommunityVlistBoardMetaOnServer(publicId);
  const entityName = meta?.entityName || "버츄얼 커뮤니티";

  return {
    title: `${entityName} 글쓰기`,
    description: `${entityName} 커뮤니티에 새 글을 작성합니다.`,
    alternates: {
      canonical: `/community/vlist/${publicId}/write`,
    },
  };
}

export default async function CommunityVlistWritePage({
  params,
  searchParams,
}: CommunityVlistWritePageProps) {
  const { publicId } = await params;
  const { user, canManageCommunityNoticeCategory } =
    await fetchCommunityAuthContext();

  if (!user) {
    redirect("/login");
  }

  const meta = await fetchCommunityVlistBoardMetaOnServer(publicId);

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
      redirect(`/community/vlist/${publicId}`);
    }
  }

  return (
    <CommunityWriteScreen
      entityType="vlist"
      entityName={meta.entityName}
      entityHref={`/community/vlist/${publicId}`}
      communityId={communityId}
      canManageCommunityNoticeCategory={canManageCommunityNoticeCategory}
      initialPost={initialPost}
    />
  );
}
