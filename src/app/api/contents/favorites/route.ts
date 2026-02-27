import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

export async function GET() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ message: "서버 설정이 올바르지 않습니다." }, { status: 500 });
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

  if (!user) {
    return NextResponse.json({ favoriteContentIds: [] as number[] });
  }

  const { data, error } = await supabase
    .from("content_favorites")
    .select("content_id")
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ message: "좋아요 목록 조회에 실패했습니다." }, { status: 500 });
  }

  const favoriteContentIds = (data || [])
    .map((row) => Number(row.content_id))
    .filter((id) => Number.isFinite(id));

  return NextResponse.json({ favoriteContentIds });
}
