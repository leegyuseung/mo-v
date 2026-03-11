import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserAccountAccessResult } from "@/utils/server-account-status";
import {
  createNoticeAdminClient,
  fetchNoticeAuthContext,
  isNoticeServerConfigured,
} from "@/api/notice-server";
import { isAdminRole } from "@/utils/role";

export async function GET() {
  if (!isNoticeServerConfigured()) {
    return NextResponse.json({ message: "서버 설정이 올바르지 않습니다." }, { status: 500 });
  }

  const cookieStore = await cookies();
  const { supabase, user, role, userError } = await fetchNoticeAuthContext(cookieStore);

  if (userError || !user) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  if (!isAdminRole(role)) {
    return NextResponse.json({ message: "공지사항 작성 권한이 없습니다." }, { status: 403 });
  }

  const access = await getUserAccountAccessResult(supabase, user.id);
  if (!access.ok) {
    return NextResponse.json({ message: access.message }, { status: access.status });
  }

  const admin = createNoticeAdminClient();
  if (!admin) {
    return NextResponse.json({ message: "서버 설정이 올바르지 않습니다." }, { status: 500 });
  }
  const { data, error } = await admin
    .from("notice_posts")
    .select("*")
    .eq("author_id", user.id)
    .eq("status", "draft")
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ message: "임시저장글 목록 조회에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ items: data || [] });
}

export async function DELETE(request: Request) {
  if (!isNoticeServerConfigured()) {
    return NextResponse.json({ message: "서버 설정이 올바르지 않습니다." }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const draftId = Number(searchParams.get("id"));

  if (!Number.isInteger(draftId) || draftId <= 0) {
    return NextResponse.json({ message: "삭제할 임시저장글 ID가 올바르지 않습니다." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const { supabase, user, role, userError } = await fetchNoticeAuthContext(cookieStore);

  if (userError || !user) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  if (!isAdminRole(role)) {
    return NextResponse.json({ message: "공지사항 작성 권한이 없습니다." }, { status: 403 });
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
    .select("id,author_id,status")
    .eq("id", draftId)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json({ message: "임시저장글 조회에 실패했습니다." }, { status: 500 });
  }

  if (!existing || existing.status !== "draft") {
    return NextResponse.json({ message: "삭제할 임시저장글을 찾을 수 없습니다." }, { status: 404 });
  }

  if (existing.author_id !== user.id) {
    return NextResponse.json({ message: "삭제 권한이 없습니다." }, { status: 403 });
  }

  const { error } = await admin
    .from("notice_posts")
    .delete()
    .eq("id", draftId)
    .eq("author_id", user.id)
    .eq("status", "draft");

  if (error) {
    return NextResponse.json({ message: "임시저장글 삭제에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
