import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return NextResponse.json({ message: "서버 설정이 올바르지 않습니다." }, { status: 500 });
  }

  let title = "";
  let detail = "";

  try {
    const body = (await request.json()) as {
      title?: string;
      detail?: string;
    };
    title = typeof body.title === "string" ? body.title.trim() : "";
    detail = typeof body.detail === "string" ? body.detail.trim() : "";
  } catch {
    return NextResponse.json({ message: "잘못된 요청 본문입니다." }, { status: 400 });
  }

  if (!title) {
    return NextResponse.json({ message: "오류 제목을 입력해 주세요." }, { status: 400 });
  }
  if (!detail) {
    return NextResponse.json({ message: "오류 상세 내용을 입력해 주세요." }, { status: 400 });
  }

  if (title.length > 120) {
    return NextResponse.json({ message: "오류 제목은 120자 이하여야 합니다." }, { status: 400 });
  }
  if (detail.length > 4000) {
    return NextResponse.json({ message: "오류 상세 내용은 4000자 이하여야 합니다." }, { status: 400 });
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

  const { data, error } = await admin
    .from("error_reports")
    .insert({
      title,
      detail,
      reporter_id: user?.id ?? null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json(
        { message: "오류 신고 테이블이 아직 생성되지 않았습니다. SQL을 먼저 적용해 주세요." },
        { status: 500 }
      );
    }
    return NextResponse.json({ message: "오류 신고 접수에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ id: data.id });
}
