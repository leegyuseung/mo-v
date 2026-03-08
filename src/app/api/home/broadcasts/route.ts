import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getUserAccountAccessResult } from "@/utils/server-account-status";
import { consumeRouteRateLimit, getRequestClientIp } from "@/utils/route-rate-limit";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

function resolveCreateBroadcastError(
  error: { code?: string | null; message?: string | null } | null
) {
  const errorCode = error?.code || "";
  const errorMessage = error?.message || "";

  if (errorCode === "42501") {
    return { status: 401, message: "로그인이 필요합니다." };
  }

  if (errorMessage.includes("하트가 부족")) {
    return { status: 400, message: "하트가 부족합니다. (100하트 필요)" };
  }

  if (errorMessage.includes("내용을 입력")) {
    return { status: 400, message: "내용을 입력해 주세요." };
  }

  if (errorMessage.includes("300자")) {
    return { status: 400, message: "내용은 300자 이하여야 합니다." };
  }

  return { status: 500, message: "전광판 등록에 실패했습니다." };
}

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

  const { data, error } = await supabase
    .from("home_broadcasts")
    .select("id,content,author_id,author_nickname,created_at,expires_at")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    if (error.code === "42P01") {
      return NextResponse.json(
        { message: "전광판 테이블이 아직 생성되지 않았습니다. SQL을 먼저 적용해 주세요." },
        { status: 500 }
      );
    }
    return NextResponse.json({ message: "전광판 조회에 실패했습니다." }, { status: 500 });
  }

  // 조회 후 만료 정리 (응답은 요청 시점 스냅샷 유지)
  try {
    await supabase.rpc("cleanup_expired_home_broadcasts");
  } catch {
    // noop
  }

  const nowMs = Date.now();
  const mapped = (data || []).map((row) => {
    const expiresAtMs = new Date(row.expires_at).getTime();
    return {
      ...row,
      author_public_id: null as string | null,
      status: Number.isFinite(expiresAtMs) && expiresAtMs > nowMs ? "active" : "ended",
    };
  });

  const authorIds = Array.from(
    new Set(
      mapped
        .map((row) => row.author_id)
        .filter((id): id is string => typeof id === "string" && id.length > 0)
    )
  );

  if (authorIds.length > 0) {
    const { data: authors } = await supabase
      .from("profiles")
      .select("id,public_id")
      .in("id", authorIds);

    const publicIdByAuthorId = new Map(
      (authors || []).map((author) => [author.id, author.public_id || null])
    );

    mapped.forEach((row) => {
      row.author_public_id = row.author_id ? publicIdByAuthorId.get(row.author_id) || null : null;
    });
  }

  return NextResponse.json({ data: mapped });
}

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ message: "서버 설정이 올바르지 않습니다." }, { status: 500 });
  }

  let content = "";
  try {
    const body = (await request.json()) as { content?: string };
    content = typeof body.content === "string" ? body.content.trim() : "";
  } catch {
    return NextResponse.json({ message: "잘못된 요청 본문입니다." }, { status: 400 });
  }

  if (!content) {
    return NextResponse.json({ message: "내용을 입력해 주세요." }, { status: 400 });
  }
  if (content.length > 300) {
    return NextResponse.json({ message: "내용은 300자 이하여야 합니다." }, { status: 400 });
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

  const rateLimit = consumeRouteRateLimit({
    key: `home-broadcast:${user.id}:${getRequestClientIp(request)}`,
    limit: 5,
    windowMs: 60 * 1000,
  });

  if (!rateLimit.ok) {
    return NextResponse.json(
      { message: "요청이 많습니다. 잠시 후 다시 시도해 주세요." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const access = await getUserAccountAccessResult(supabase, user.id);
  if (!access.ok) {
    return NextResponse.json({ message: access.message }, { status: access.status });
  }

  const { data, error } = await supabase.rpc("create_home_broadcast", {
    p_content: content,
  });

  if (error) {
    console.error("create_home_broadcast rpc failed", {
      code: error.code,
      message: error.message,
    });
    const { status, message } = resolveCreateBroadcastError(error);
    return NextResponse.json({ message }, { status });
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) {
    return NextResponse.json({ message: "전광판 등록 결과를 확인할 수 없습니다." }, { status: 500 });
  }

  return NextResponse.json({
    id: row.out_id ?? row.id,
    content: row.out_content ?? row.content,
    author_nickname: row.out_author_nickname ?? row.author_nickname,
    created_at: row.out_created_at ?? row.created_at,
    after_point: row.out_after_point ?? row.after_point,
  });
}
