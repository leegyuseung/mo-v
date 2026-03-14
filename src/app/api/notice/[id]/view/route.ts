import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createNoticeAdminClient, createNoticeRequestClient, isNoticeServerConfigured } from "@/api/notice-server";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!isNoticeServerConfigured()) {
    return NextResponse.json({ message: "서버 설정이 올바르지 않습니다." }, { status: 500 });
  }

  const { id } = await context.params;
  const noticeId = Number(id);

  if (!Number.isInteger(noticeId) || noticeId <= 0) {
    return NextResponse.json({ message: "잘못된 공지사항 ID입니다." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createNoticeRequestClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const admin = createNoticeAdminClient();
  if (!admin) {
    return NextResponse.json({ message: "서버 설정이 올바르지 않습니다." }, { status: 500 });
  }

  const { data: notice, error: noticeError } = await admin
    .from("notice_posts")
    .select("id,author_id,status,view_count,deleted_at")
    .eq("id", noticeId)
    .maybeSingle();

  if (noticeError) {
    return NextResponse.json({ message: "공지사항 조회에 실패했습니다." }, { status: 500 });
  }

  if (!notice || notice.status !== "published" || notice.deleted_at) {
    return NextResponse.json({ message: "공지사항을 찾을 수 없습니다." }, { status: 404 });
  }

  if (user?.id && notice.author_id === user.id) {
    return NextResponse.json({ incremented: false, view_count: notice.view_count });
  }

  const nextViewCount = (notice.view_count || 0) + 1;
  const { error: updateError } = await admin
    .from("notice_posts")
    .update({ view_count: nextViewCount })
    .eq("id", noticeId);

  if (updateError) {
    return NextResponse.json({ message: "공지사항 조회수 업데이트에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ incremented: true, view_count: nextViewCount });
}
