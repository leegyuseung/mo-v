import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function isMissingRpcFunctionError(error: unknown, functionName: string) {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? String(error.code) : "";
  const message = "message" in error ? String(error.message) : "";
  return code === "42883" || message.includes(functionName);
}

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return NextResponse.json({ message: "서버 설정이 올바르지 않습니다." }, { status: 500 });
  }

  const { id } = await context.params;
  const contentId = Number(id);
  if (!Number.isInteger(contentId) || contentId <= 0) {
    return NextResponse.json({ message: "잘못된 콘텐츠 ID입니다." }, { status: 400 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      },
    },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const admin = createAdminClient(supabaseUrl, serviceRoleKey);

  const { data: content, error: contentError } = await admin
    .from("contents")
    .select("id,status")
    .eq("id", contentId)
    .maybeSingle();

  if (contentError) {
    return NextResponse.json({ message: "콘텐츠 조회에 실패했습니다." }, { status: 500 });
  }

  if (!content) {
    return NextResponse.json({ message: "콘텐츠를 찾을 수 없습니다." }, { status: 404 });
  }

  if (
    content.status === "pending" ||
    content.status === "ended" ||
    content.status === "rejected" ||
    content.status === "cancelled" ||
    content.status === "deleted"
  ) {
    return NextResponse.json({ message: "좋아요할 수 없는 콘텐츠입니다." }, { status: 400 });
  }

  const functionName = "toggle_content_favorite";
  const { data: rpcData, error: rpcError } = await admin.rpc(functionName, {
    p_content_id: contentId,
    p_user_id: user.id,
  });

  if (!rpcError) {
    const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
    return NextResponse.json({
      liked: Boolean(row?.liked),
      favorite_count: Number(row?.favorite_count ?? 0),
    });
  }

  if (!isMissingRpcFunctionError(rpcError, functionName)) {
    return NextResponse.json({ message: "좋아요 처리에 실패했습니다." }, { status: 500 });
  }

  // RPC 미적용 환경 fallback
  const { data: existingFavorite, error: existingFavoriteError } = await admin
    .from("content_favorites")
    .select("content_id")
    .eq("content_id", contentId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (existingFavoriteError) {
    return NextResponse.json({ message: "좋아요 상태 확인에 실패했습니다." }, { status: 500 });
  }

  let liked = false;

  if (existingFavorite) {
    const { error: deleteError } = await admin
      .from("content_favorites")
      .delete()
      .eq("content_id", contentId)
      .eq("user_id", user.id);

    if (deleteError) {
      return NextResponse.json({ message: "좋아요 취소에 실패했습니다." }, { status: 500 });
    }
  } else {
    const { error: insertError } = await admin
      .from("content_favorites")
      .insert({
        content_id: contentId,
        user_id: user.id,
      });

    if (insertError) {
      return NextResponse.json({ message: "좋아요 등록에 실패했습니다." }, { status: 500 });
    }

    liked = true;
  }

  const { count, error: countError } = await admin
    .from("content_favorites")
    .select("*", { count: "exact", head: true })
    .eq("content_id", contentId);

  if (countError) {
    return NextResponse.json({ message: "좋아요 수 조회에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({
    liked,
    favorite_count: count || 0,
  });
}
