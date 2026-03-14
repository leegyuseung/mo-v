import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserAccountAccessResult } from "@/utils/server-account-status";
import {
  createNoticeAdminClient,
  fetchNoticeAuthContext,
  isNoticeServerConfigured,
} from "@/api/notice-server";
import { isAdminRole } from "@/utils/role";

type NoticeRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_request: Request, { params }: NoticeRouteContext) {
  if (!isNoticeServerConfigured()) {
    return NextResponse.json({ message: "서버 설정이 올바르지 않습니다." }, { status: 500 });
  }

  const { id } = await params;
  const noticeId = Number(id);
  if (!Number.isInteger(noticeId) || noticeId <= 0) {
    return NextResponse.json({ message: "공지사항 번호가 올바르지 않습니다." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const { supabase, user, role, userError } = await fetchNoticeAuthContext(cookieStore);
  if (userError || !user) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  if (!isAdminRole(role)) {
    return NextResponse.json({ message: "공지사항 삭제 권한이 없습니다." }, { status: 403 });
  }

  const access = await getUserAccountAccessResult(supabase, user.id);
  if (!access.ok) {
    return NextResponse.json({ message: access.message }, { status: access.status });
  }

  const admin = createNoticeAdminClient();
  if (!admin) {
    return NextResponse.json({ message: "서버 설정이 올바르지 않습니다." }, { status: 500 });
  }

  const { data: existing, error: existingError } = await admin
    .from("notice_posts")
    .select("id,author_id,deleted_at")
    .eq("id", noticeId)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ message: "공지사항 조회에 실패했습니다." }, { status: 500 });
  }

  if (!existing || existing.deleted_at) {
    return NextResponse.json({ message: "삭제할 공지사항을 찾을 수 없습니다." }, { status: 404 });
  }

  if (existing.author_id !== user.id) {
    return NextResponse.json({ message: "삭제 권한이 없습니다." }, { status: 403 });
  }

  const { error } = await admin
    .from("notice_posts")
    .update({
      status: "deleted",
      deleted_at: new Date().toISOString(),
      deleted_by: user.id,
    })
    .eq("id", noticeId)
    .eq("author_id", user.id)
    .is("deleted_at", null);

  if (error) {
    return NextResponse.json({ message: "공지사항 삭제에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
