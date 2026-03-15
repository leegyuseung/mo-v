import { NextResponse } from "next/server";
import { getUserAccountAccessResult } from "@/utils/server-account-status";
import {
  createCommunityAdminClient,
  fetchCommunityAuthContext,
  isCommunityServerConfigured,
} from "@/api/community-server";
import type { CommunityCategory, CommunitySavePayload } from "@/types/community";
import { canManageCommunityNoticeCategory } from "@/utils/community-permission";

const VALID_CATEGORIES = [
  "notice",
  "general",
  "info_schedule",
  "broadcast_review",
  "broadcast_summary",
] as const;
const VALID_SAVE_STATUSES = ["draft", "published"] as const;

function isValidCategory(value: string): value is CommunityCategory {
  return VALID_CATEGORIES.includes(value as CommunityCategory);
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

function hasMeaningfulHtmlContent(html: string) {
  const normalizedHtml = html.trim();
  if (!normalizedHtml) return false;

  if (
    /<(img|iframe|video|audio|embed)\b/i.test(normalizedHtml) ||
    /data-youtube-embed=/i.test(normalizedHtml)
  ) {
    return true;
  }

  return getPlainTextFromHtml(normalizedHtml).length > 0;
}

export async function POST(request: Request) {
  if (!isCommunityServerConfigured()) {
    return NextResponse.json(
      { message: "서버 설정이 올바르지 않습니다." },
      { status: 500 }
    );
  }

  let payload: CommunitySavePayload | null = null;

  try {
    const body = (await request.json()) as Partial<CommunitySavePayload>;
    payload = {
      id: Number.isInteger(body.id) ? body.id : undefined,
      communityId:
        typeof body.communityId === "number" && body.communityId > 0
          ? body.communityId
          : 0,
      category:
        typeof body.category === "string" && isValidCategory(body.category)
          ? body.category
          : "general",
      title: typeof body.title === "string" ? body.title.trim() : "",
      contentHtml: typeof body.contentHtml === "string" ? body.contentHtml : "",
      status: typeof body.status === "string" ? body.status : "draft",
    };
  } catch {
    return NextResponse.json(
      { message: "잘못된 요청 본문입니다." },
      { status: 400 }
    );
  }

  if (!payload || payload.communityId <= 0) {
    return NextResponse.json(
      { message: "커뮤니티 정보를 확인할 수 없습니다." },
      { status: 400 }
    );
  }

  if (!isValidSaveStatus(payload.status)) {
    return NextResponse.json(
      { message: "저장 상태가 올바르지 않습니다." },
      { status: 400 }
    );
  }

  if (!isValidCategory(payload.category)) {
    return NextResponse.json(
      { message: "카테고리 값이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  if (payload.title.length > 120) {
    return NextResponse.json(
      { message: "제목은 120자 이하여야 합니다." },
      { status: 400 }
    );
  }

  const hasContent = hasMeaningfulHtmlContent(payload.contentHtml);

  if (payload.status === "published") {
    if (!payload.title) {
      return NextResponse.json(
        { message: "제목을 입력해 주세요." },
        { status: 400 }
      );
    }

    if (!hasContent) {
      return NextResponse.json(
        { message: "본문을 입력해 주세요." },
        { status: 400 }
      );
    }
  } else if (!payload.title && !hasContent) {
    return NextResponse.json(
      { message: "임시저장하려면 제목이나 본문 중 하나는 입력해 주세요." },
      { status: 400 }
    );
  }

  const { supabase, user, role, userError } =
    await fetchCommunityAuthContext();
  const canManageNoticeCategory = canManageCommunityNoticeCategory(role);

  if (userError || !user) {
    return NextResponse.json(
      { message: "로그인이 필요합니다." },
      { status: 401 }
    );
  }

  if (payload.category === "notice" && !canManageNoticeCategory) {
    return NextResponse.json(
      { message: "공지 카테고리는 관리자 또는 매니저만 사용할 수 있습니다." },
      { status: 403 }
    );
  }

  const access = await getUserAccountAccessResult(supabase, user.id);
  if (!access.ok) {
    return NextResponse.json(
      { message: access.message },
      { status: access.status }
    );
  }

  const admin = createCommunityAdminClient();
  if (!admin) {
    return NextResponse.json(
      { message: "서버 설정이 올바르지 않습니다." },
      { status: 500 }
    );
  }

  const normalizedIsPinned = payload.category === "notice" && canManageNoticeCategory;

  if (payload.id) {
    const { data: existing, error: existingError } = await admin
      .from("community_posts")
      .select("id,author_id,community_id,status,published_at")
      .eq("id", payload.id)
      .is("deleted_at", null)
      .maybeSingle();

    if (existingError) {
      return NextResponse.json(
        { message: "커뮤니티 글 조회에 실패했습니다." },
        { status: 500 }
      );
    }

    if (!existing || existing.community_id !== payload.communityId) {
      return NextResponse.json(
        { message: "수정할 글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (existing.author_id !== user.id && !canManageNoticeCategory) {
      return NextResponse.json(
        { message: "수정 권한이 없습니다." },
        { status: 403 }
      );
    }

    // draft → published 전환 시에만 published_at을 현재 시각으로 설정
    // 이미 published 상태라면 최초 발행일 유지, draft로 되돌리면 null 처리
    const publishedAtUpdate =
      payload.status === "published" && existing.status !== "published"
        ? new Date().toISOString()
        : payload.status === "draft"
          ? null
          : existing.published_at ?? null;

    const { data, error } = await admin
      .from("community_posts")
      .update({
        category: payload.category,
        title: payload.title,
        content_html: payload.contentHtml,
        is_pinned: normalizedIsPinned,
        status: payload.status,
        published_at: publishedAtUpdate,
      })
      .eq("id", payload.id)
      .select("id,status")
      .single();

    if (error || !data) {
      return NextResponse.json(
        { message: "커뮤니티 글 저장에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id: data.id,
      status: data.status,
    });
  }

  const { data, error } = await admin
    .from("community_posts")
    .insert({
      community_id: payload.communityId,
      author_id: user.id,
      category: payload.category,
      title: payload.title,
      content_html: payload.contentHtml,
      is_pinned: normalizedIsPinned,
      status: payload.status,
      // published 상태로 저장 시 발행일을 현재 시각으로 기록
      published_at: payload.status === "published" ? new Date().toISOString() : null,
    })
    .select("id,status")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { message: "커뮤니티 글 저장에 실패했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    id: data.id,
    status: data.status,
  });
}
