import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserAccountAccessResult } from "@/utils/server-account-status";
import {
  createNoticeAdminClient,
  fetchNoticeAuthContext,
  isNoticeServerConfigured,
} from "@/api/notice-server";

type NoticeLikeRouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(_request: Request, { params }: NoticeLikeRouteContext) {
  if (!isNoticeServerConfigured()) {
    return NextResponse.json({ message: "서버 설정이 올바르지 않습니다." }, { status: 500 });
  }

  const { id } = await params;
  const noticeId = Number(id);
  if (!Number.isInteger(noticeId) || noticeId <= 0) {
    return NextResponse.json({ message: "공지사항 번호가 올바르지 않습니다." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const { supabase, user, userError } = await fetchNoticeAuthContext(cookieStore);
  if (userError || !user) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const access = await getUserAccountAccessResult(supabase, user.id);
  if (!access.ok) {
    return NextResponse.json({ message: access.message }, { status: access.status });
  }

  const admin = createNoticeAdminClient();
  if (!admin) {
    return NextResponse.json({ message: "서버 설정이 올바르지 않습니다." }, { status: 500 });
  }

  const { data: notice, error: noticeError } = await admin
    .from("notice_posts")
    .select("id,status,deleted_at")
    .eq("id", noticeId)
    .maybeSingle();

  if (noticeError) {
    return NextResponse.json({ message: "공지사항 조회에 실패했습니다." }, { status: 500 });
  }

  if (!notice || notice.status !== "published" || notice.deleted_at) {
    return NextResponse.json({ message: "공지사항을 찾을 수 없습니다." }, { status: 404 });
  }

  const { data: existingReaction, error: reactionError } = await admin
    .from("notice_post_reactions")
    .select("id,reaction")
    .eq("notice_post_id", noticeId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (reactionError) {
    return NextResponse.json({ message: "좋아요 상태 확인에 실패했습니다." }, { status: 500 });
  }

  let liked = false;

  if (existingReaction?.reaction === "like") {
    const { error } = await admin
      .from("notice_post_reactions")
      .delete()
      .eq("id", existingReaction.id);

    if (error) {
      return NextResponse.json({ message: "좋아요 취소에 실패했습니다." }, { status: 500 });
    }
  } else if (existingReaction) {
    const { error } = await admin
      .from("notice_post_reactions")
      .update({ reaction: "like" })
      .eq("id", existingReaction.id);

    if (error) {
      return NextResponse.json({ message: "좋아요 처리에 실패했습니다." }, { status: 500 });
    }

    liked = true;
  } else {
    const { error } = await admin
      .from("notice_post_reactions")
      .insert({
        notice_post_id: noticeId,
        user_id: user.id,
        reaction: "like",
      });

    if (error) {
      return NextResponse.json({ message: "좋아요 처리에 실패했습니다." }, { status: 500 });
    }

    liked = true;
  }

  const { data: updatedNotice, error: updatedNoticeError } = await admin
    .from("notice_posts")
    .select("like_count")
    .eq("id", noticeId)
    .single();

  if (updatedNoticeError || !updatedNotice) {
    return NextResponse.json({ message: "좋아요 수 조회에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({
    liked,
    like_count: updatedNotice.like_count,
  });
}
