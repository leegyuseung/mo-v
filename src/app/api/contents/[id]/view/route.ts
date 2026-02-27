import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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
  } = await supabase.auth.getUser();

  const admin = createAdminClient(supabaseUrl, serviceRoleKey);

  const { data: content, error: contentError } = await admin
    .from("contents")
    .select("id,created_by,status,view_count")
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
    content.status === "rejected" ||
    content.status === "cancelled" ||
    content.status === "deleted"
  ) {
    return NextResponse.json({ incremented: false });
  }

  if (user?.id && content.created_by && user.id === content.created_by) {
    return NextResponse.json({ incremented: false });
  }

  const nextViewCount = (content.view_count || 0) + 1;
  const { error: updateError } = await admin
    .from("contents")
    .update({ view_count: nextViewCount })
    .eq("id", contentId);

  if (updateError) {
    return NextResponse.json({ message: "조회수 업데이트에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ incremented: true, view_count: nextViewCount });
}
