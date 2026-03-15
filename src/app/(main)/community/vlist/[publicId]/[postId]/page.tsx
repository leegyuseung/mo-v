import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  fetchCommunityAuthContext,
  fetchCommunityVlistBoardMetaOnServer,
  fetchPublishedCommunityPostByIdOnServer,
} from "@/api/community-server";
import CommunityDetailScreen from "@/components/screens/community/community-detail-screen";
import { SITE_DESCRIPTION } from "@/lib/seo";
import {
  getCommunityDescription,
} from "@/utils/community-format";
import { getCommunityPostPermission } from "@/utils/community-permission";

type CommunityVlistPostDetailPageProps = {
  params: Promise<{
    publicId: string;
    postId: string;
  }>;
};

export async function generateMetadata({
  params,
}: CommunityVlistPostDetailPageProps): Promise<Metadata> {
  const { publicId, postId } = await params;
  const parsedPostId = Number(postId);
  const meta = await fetchCommunityVlistBoardMetaOnServer(publicId);

  if (!meta || !Number.isInteger(parsedPostId) || parsedPostId <= 0) {
    return { description: SITE_DESCRIPTION };
  }

  const post = await fetchPublishedCommunityPostByIdOnServer({
    postId: parsedPostId,
    communityId: meta.communityId,
  });

  if (!post) {
    return { description: SITE_DESCRIPTION };
  }

  return {
    title: post.title || `${meta.entityName} 커뮤니티`,
    description: getCommunityDescription(post.content_html) || SITE_DESCRIPTION,
    alternates: {
      canonical: `/community/vlist/${publicId}/${parsedPostId}`,
    },
  };
}

export default async function CommunityVlistPostDetailPage({
  params,
}: CommunityVlistPostDetailPageProps) {
  const { publicId, postId } = await params;
  const parsedPostId = Number(postId);

  if (!Number.isInteger(parsedPostId) || parsedPostId <= 0) {
    notFound();
  }

  const meta = await fetchCommunityVlistBoardMetaOnServer(publicId);
  if (!meta) {
    notFound();
  }

  const post = await fetchPublishedCommunityPostByIdOnServer({
    postId: parsedPostId,
    communityId: meta.communityId,
  });
  if (!post) {
    notFound();
  }

  const { supabase, user, role } = await fetchCommunityAuthContext();
  const permission = getCommunityPostPermission({
    authorId: post.author_id,
    viewerId: user?.id,
    role,
  });
  let initialLiked = false;

  if (user) {
    const { data: reaction } = await supabase
      .from("community_post_reactions")
      .select("reaction_type")
      .eq("post_id", parsedPostId)
      .eq("user_id", user.id)
      .maybeSingle();

    initialLiked = reaction?.reaction_type === "like";
  }

  return (
    <CommunityDetailScreen
      post={post}
      isLoggedIn={permission.isLoggedIn}
      isAuthor={permission.isAuthor}
      canManage={permission.canManage}
      initialLiked={initialLiked}
      entityType="vlist"
      entityPublicId={publicId}
    />
  );
}
