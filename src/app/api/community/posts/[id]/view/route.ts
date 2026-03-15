import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createCommunityAdminClient,
  createCommunityRequestClient,
  isCommunityServerConfigured,
} from "@/api/community-server";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!isCommunityServerConfigured()) {
    return NextResponse.json({ message: "서버 설정이 올바르지 않습니다." }, { status: 500 });
  }

  const { id } = await context.params;
  const postId = Number(id);

  if (!Number.isInteger(postId) || postId <= 0) {
    return NextResponse.json({ message: "잘못된 커뮤니티 글 ID입니다." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createCommunityRequestClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createCommunityAdminClient();
  if (!admin) {
    return NextResponse.json({ message: "서버 설정이 올바르지 않습니다." }, { status: 500 });
  }

  const { data: post, error: postError } = await admin
    .from("community_posts")
    .select("id,author_id,status,view_count,deleted_at")
    .eq("id", postId)
    .maybeSingle();

  if (postError) {
    return NextResponse.json({ message: "커뮤니티 글 조회에 실패했습니다." }, { status: 500 });
  }

  if (!post || post.status !== "published" || post.deleted_at) {
    return NextResponse.json({ message: "커뮤니티 글을 찾을 수 없습니다." }, { status: 404 });
  }

  if (user?.id && post.author_id === user.id) {
    return NextResponse.json({ incremented: false, view_count: post.view_count });
  }

  const nextViewCount = (post.view_count || 0) + 1;
  const { error: updateError } = await admin
    .from("community_posts")
    .update({ view_count: nextViewCount })
    .eq("id", postId);

  if (updateError) {
    return NextResponse.json({ message: "커뮤니티 글 조회수 업데이트에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ incremented: true, view_count: nextViewCount });
}
