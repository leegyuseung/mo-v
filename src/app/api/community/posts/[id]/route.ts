import { NextResponse } from "next/server";
import { getUserAccountAccessResult } from "@/utils/server-account-status";
import {
  createCommunityAdminClient,
  fetchCommunityAuthContext,
  isCommunityServerConfigured,
} from "@/api/community-server";
import { getCommunityPostPermission } from "@/utils/community-permission";

type CommunityRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  _request: Request,
  { params }: CommunityRouteContext
) {
  if (!isCommunityServerConfigured()) {
    return NextResponse.json({ message: "서버 설정이 올바르지 않습니다." }, { status: 500 });
  }

  const { id } = await params;
  const postId = Number(id);
  if (!Number.isInteger(postId) || postId <= 0) {
    return NextResponse.json({ message: "커뮤니티 글 번호가 올바르지 않습니다." }, { status: 400 });
  }

  const { supabase, user, role, userError } = await fetchCommunityAuthContext();
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

  const { data: existing, error: existingError } = await admin
    .from("community_posts")
    .select("id,author_id,deleted_at")
    .eq("id", postId)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ message: "커뮤니티 글 조회에 실패했습니다." }, { status: 500 });
  }

  if (!existing || existing.deleted_at) {
    return NextResponse.json({ message: "삭제할 커뮤니티 글을 찾을 수 없습니다." }, { status: 404 });
  }

  const permission = getCommunityPostPermission({
    authorId: existing.author_id,
    viewerId: user.id,
    role,
  });

  if (!permission.canManage) {
    return NextResponse.json({ message: "삭제 권한이 없습니다." }, { status: 403 });
  }

  let query = admin
    .from("community_posts")
    .update({
      status: "deleted",
      deleted_at: new Date().toISOString(),
      deleted_by: user.id,
    })
    .eq("id", postId)
    .is("deleted_at", null);

  if (!permission.canManage || permission.isAuthor) {
    query = query.eq("author_id", user.id);
  }

  const { error } = await query;

  if (error) {
    return NextResponse.json({ message: "커뮤니티 글 삭제에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
