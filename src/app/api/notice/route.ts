import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserAccountAccessResult } from "@/utils/server-account-status";
import type { NoticeCategory, NoticeSavePayload } from "@/types/notice";
import {
  createNoticeAdminClient,
  fetchNoticeAuthContext,
  isNoticeServerConfigured,
} from "@/api/notice-server";
import { isAdminRole } from "@/utils/role";

const VALID_CATEGORIES = ["notice", "event"] as const;
const VALID_SAVE_STATUSES = ["draft", "published"] as const;

function isValidCategory(value: string): value is NoticeCategory {
  return VALID_CATEGORIES.includes(value as NoticeCategory);
}

function isValidSaveStatus(value: string): value is "draft" | "published" {
  return VALID_SAVE_STATUSES.includes(value as "draft" | "published");
}

function getPlainTextFromHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET(request: Request) {
  if (!isNoticeServerConfigured()) {
    return NextResponse.json({ message: "서버 설정이 올바르지 않습니다." }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const categoryParam = searchParams.get("category");

  if (categoryParam && !isValidCategory(categoryParam)) {
    return NextResponse.json({ message: "카테고리 값이 올바르지 않습니다." }, { status: 400 });
  }

  const admin = createNoticeAdminClient();
  if (!admin) {
    return NextResponse.json({ message: "서버 설정이 올바르지 않습니다." }, { status: 500 });
  }

  let query = admin
    .from("notice_posts")
    .select("*")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("is_pinned", { ascending: false })
    .order("published_at", { ascending: false })
    .order("id", { ascending: false });

  if (categoryParam) {
    query = query.eq("category", categoryParam);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ message: "공지사항 목록 조회에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ items: data || [] });
}

export async function POST(request: Request) {
  if (!isNoticeServerConfigured()) {
    return NextResponse.json({ message: "서버 설정이 올바르지 않습니다." }, { status: 500 });
  }

  let payload: NoticeSavePayload | null = null;

  try {
    const body = (await request.json()) as Partial<NoticeSavePayload>;
    payload = {
      id: Number.isInteger(body.id) ? body.id : undefined,
      category:
        typeof body.category === "string" && isValidCategory(body.category)
          ? body.category
          : "notice",
      title: typeof body.title === "string" ? body.title.trim() : "",
      contentHtml: typeof body.contentHtml === "string" ? body.contentHtml : "",
      isPinned: body.isPinned === true,
      status: typeof body.status === "string" ? body.status : "draft",
    };
  } catch {
    return NextResponse.json({ message: "잘못된 요청 본문입니다." }, { status: 400 });
  }

  if (!payload || !isValidSaveStatus(payload.status)) {
    return NextResponse.json({ message: "저장 상태가 올바르지 않습니다." }, { status: 400 });
  }

  if (!isValidCategory(payload.category || "")) {
    return NextResponse.json({ message: "카테고리 값이 올바르지 않습니다." }, { status: 400 });
  }

  if (payload.title.length > 80) {
    return NextResponse.json({ message: "제목은 80자 이하여야 합니다." }, { status: 400 });
  }

  const plainText = getPlainTextFromHtml(payload.contentHtml);

  if (payload.status === "published") {
    if (!payload.title) {
      return NextResponse.json({ message: "제목을 입력해 주세요." }, { status: 400 });
    }

    if (!plainText) {
      return NextResponse.json({ message: "본문을 입력해 주세요." }, { status: 400 });
    }
  } else if (!payload.title && !plainText) {
    return NextResponse.json(
      { message: "임시저장하려면 제목이나 본문 중 하나는 입력해 주세요." },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const { supabase, user, role, userError } = await fetchNoticeAuthContext(cookieStore);

  if (userError || !user) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  // Why: 목록 버튼을 숨겨도 route 직접 호출로 우회 가능해서 서버에서 다시 막아야 한다.
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

  if (payload.id) {
    const { data: existing, error: existingError } = await admin
      .from("notice_posts")
      .select("id,author_id")
      .eq("id", payload.id)
      .is("deleted_at", null)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json({ message: "공지사항 조회에 실패했습니다." }, { status: 500 });
    }

    if (!existing) {
      return NextResponse.json({ message: "수정할 공지사항을 찾을 수 없습니다." }, { status: 404 });
    }

    if (existing.author_id !== user.id) {
      return NextResponse.json({ message: "수정 권한이 없습니다." }, { status: 403 });
    }

    const { data, error } = await admin
      .from("notice_posts")
      .update({
        category: payload.category,
        title: payload.title,
        content_html: payload.contentHtml,
        is_pinned: payload.isPinned,
        status: payload.status,
      })
      .eq("id", payload.id)
      .eq("author_id", user.id)
      .select("id,status")
      .single();

    if (error || !data) {
      return NextResponse.json({ message: "공지사항 저장에 실패했습니다." }, { status: 500 });
    }

    return NextResponse.json({
      id: data.id,
      status: data.status,
    });
  }

  const { data, error } = await admin
    .from("notice_posts")
    .insert({
      author_id: user.id,
      category: payload.category,
      title: payload.title,
      content_html: payload.contentHtml,
      is_pinned: payload.isPinned,
      status: payload.status,
    })
    .select("id,status")
    .single();

  if (error || !data) {
    return NextResponse.json({ message: "공지사항 저장에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({
    id: data.id,
    status: data.status,
  });
}
