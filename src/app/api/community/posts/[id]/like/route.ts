import { NextResponse } from "next/server";
import { getUserAccountAccessResult } from "@/utils/server-account-status";
import {
  createCommunityAdminClient,
  fetchCommunityAuthContext,
  isCommunityServerConfigured,
} from "@/api/community-server";

type CommunityLikeRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  _request: Request,
  { params }: CommunityLikeRouteContext
) {
  if (!isCommunityServerConfigured()) {
    return NextResponse.json({ message: "서버 설정이 올바르지 않습니다." }, { status: 500 });
  }

  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId) || postId <= 0) {
    return NextResponse.json({ message: "커뮤니티 글 번호가 올바르지 않습니다." }, { status: 400 });
  }

  const { supabase, user, userError } = await fetchCommunityAuthContext();
  if (userError || !user) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const access = await getUserAccountAccessResult(supabase, user.id);
  if (!access.ok) {
    return NextResponse.json({ message: access.message }, { status: access.status });
  }

  const admin = createCommunityAdminClient();
  if (!admin) {
    return NextResponse.json({ message: "서버 설정이 올바르지 않습니다." }, { status: 500 });
  }

  const { data: post, error: postError } = await admin
    .from("community_posts")
    .select("id,status,deleted_at")
    .eq("id", postId)
    .maybeSingle();

  if (postError) {
    return NextResponse.json({ message: "커뮤니티 글 조회에 실패했습니다." }, { status: 500 });
  }

  if (!post || post.status !== "published" || post.deleted_at) {
    return NextResponse.json({ message: "커뮤니티 글을 찾을 수 없습니다." }, { status: 404 });
  }

  const { data: existingReaction, error: reactionError } = await admin
    .from("community_post_reactions")
    .select("id,reaction_type")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (reactionError) {
    return NextResponse.json({ message: "좋아요 상태 확인에 실패했습니다." }, { status: 500 });
  }

  let liked = false;

  if (existingReaction?.reaction_type === "like") {
    const { error } = await admin
      .from("community_post_reactions")
      .delete()
      .eq("id", existingReaction.id);

    if (error) {
      return NextResponse.json({ message: "좋아요 취소에 실패했습니다." }, { status: 500 });
    }
  } else if (existingReaction) {
    const { error } = await admin
      .from("community_post_reactions")
      .update({ reaction_type: "like" })
      .eq("id", existingReaction.id);

    if (error) {
      return NextResponse.json({ message: "좋아요 처리에 실패했습니다." }, { status: 500 });
    }

    liked = true;
  } else {
    const { error } = await admin.from("community_post_reactions").insert({
      post_id: postId,
      user_id: user.id,
      reaction_type: "like",
    });

    if (error) {
      return NextResponse.json({ message: "좋아요 처리에 실패했습니다." }, { status: 500 });
    }

    liked = true;
  }

  const { data: updatedPost, error: updatedPostError } = await admin
    .from("community_posts")
    .select("like_count")
    .eq("id", postId)
    .single();

  if (updatedPostError || !updatedPost) {
    return NextResponse.json({ message: "좋아요 수 조회에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({
    liked,
    like_count: updatedPost.like_count,
  });
}
