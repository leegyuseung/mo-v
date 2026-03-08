import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { hasAdminAccess } from "@/utils/role";
import { getEffectiveHomeBroadcastStatus } from "@/utils/home-broadcast";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function formatProfileLabel(profile?: {
  nickname?: string | null;
  nickname_code?: string | null;
  email?: string | null;
} | null) {
  if (!profile) return null;
  if (profile.nickname) {
    return profile.nickname_code
      ? `${profile.nickname} #${profile.nickname_code}`
      : profile.nickname;
  }
  return profile.email || null;
}

export async function GET() {
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return NextResponse.json({ message: "서버 설정이 올바르지 않습니다." }, { status: 500 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
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

  const { data: me, error: meError } = await supabase
    .from("profiles")
    .select("id,role")
    .eq("id", user.id)
    .maybeSingle();

  if (meError || !me || !hasAdminAccess(me.role)) {
    return NextResponse.json({ message: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const admin = createAdminClient(supabaseUrl, serviceRoleKey);
  try {
    await admin.rpc("sync_expired_home_broadcasts");
  } catch (error) {
    // 운영 RPC가 실패해도 관리자 화면 상태는 expires_at 기반 fallback으로 계속 계산한다.
    console.error("sync_expired_home_broadcasts failed", error);
  }

  const { data: rows, error } = await admin
    .from("home_broadcasts")
    .select("id,content,author_id,author_nickname,created_at,expires_at,status,deleted_at,deleted_by,deleted_reason")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ message: "전광판 목록 조회에 실패했습니다." }, { status: 500 });
  }

  const authorIds = Array.from(
    new Set(
      (rows || [])
        .map((row) => row.author_id)
        .filter((value): value is string => typeof value === "string" && value.length > 0)
    )
  );
  const deletedByIds = Array.from(
    new Set(
      (rows || [])
        .map((row) => row.deleted_by)
        .filter((value): value is string => typeof value === "string" && value.length > 0)
    )
  );

  const profileIds = Array.from(new Set([...authorIds, ...deletedByIds]));
  const { data: profiles } = profileIds.length
    ? await admin
        .from("profiles")
        .select("id,public_id,nickname,nickname_code,email")
        .in("id", profileIds)
    : { data: [] as Array<{
        id: string;
        public_id: string | null;
        nickname: string | null;
        nickname_code: string | null;
        email: string | null;
      }> };

  const profilesById = new Map((profiles || []).map((profile) => [profile.id, profile] as const));
  return NextResponse.json({
    data: (rows || []).map((row) => {
      const author = row.author_id ? profilesById.get(row.author_id) : null;
      const deletedBy = row.deleted_by ? profilesById.get(row.deleted_by) : null;
      return {
        ...row,
        author_public_id: author?.public_id || null,
        deleted_by_label: formatProfileLabel(deletedBy),
        status: getEffectiveHomeBroadcastStatus(row),
      };
    }),
  });
}
