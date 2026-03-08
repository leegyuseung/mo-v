import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { hasAdminAccess, normalizeRole } from "@/utils/role";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type SanctionRow = {
  user_id: string;
  action_type: string;
  reason: string;
  internal_note?: string | null;
  created_at: string;
  created_by: string;
  suspended_until: string | null;
};

function formatSanctionActorLabel(profile?: {
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
    return NextResponse.json(
      { message: "서버 설정이 올바르지 않습니다." },
      { status: 500 }
    );
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

  const { data: me, error: meError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (meError || !me || !hasAdminAccess(me.role)) {
    return NextResponse.json({ message: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const admin = createAdminClient(supabaseUrl, serviceRoleKey);
  const { data: users, error: usersError } = await admin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (usersError) {
    return NextResponse.json({ message: "유저 목록 조회에 실패했습니다." }, { status: 500 });
  }

  const userIds = (users || []).map((profile) => profile.id);
  if (userIds.length === 0) {
    return NextResponse.json([]);
  }

  const sanctionSelect =
    normalizeRole(me.role) === "admin"
      ? "user_id,action_type,reason,internal_note,created_at,created_by,suspended_until"
      : "user_id,action_type,reason,created_at,created_by,suspended_until";

  const { data: sanctionRows, error: sanctionError } = await admin
    .from("user_sanctions")
    .select(sanctionSelect)
    .in("user_id", userIds)
    .order("created_at", { ascending: false });

  if (sanctionError) {
    return NextResponse.json(users || []);
  }

  const parsedSanctionRows = (sanctionRows || []) as unknown as SanctionRow[];

  const sanctionCreatorIds = Array.from(
    new Set(parsedSanctionRows.map((row) => row.created_by).filter(Boolean))
  );

  const { data: sanctionCreators } = sanctionCreatorIds.length
    ? await admin
        .from("profiles")
        .select("id,nickname,nickname_code,email,role")
        .in("id", sanctionCreatorIds)
    : { data: [] as Array<{
        id: string;
        nickname: string | null;
        nickname_code: string | null;
        email: string | null;
        role: string | null;
      }> };

  const sanctionCreatorsById = new Map(
    (sanctionCreators || []).map((profile) => [profile.id, profile] as const)
  );

  const latestSanctionByUserId = new Map<string, Record<string, unknown>>();
  for (const row of parsedSanctionRows) {
    if (!latestSanctionByUserId.has(row.user_id)) {
      const creator = sanctionCreatorsById.get(row.created_by);
      latestSanctionByUserId.set(row.user_id, {
        ...row,
        internal_note: "internal_note" in row ? row.internal_note : null,
        created_by_name: formatSanctionActorLabel(creator),
        created_by_email: creator?.email || null,
        created_by_role: creator?.role || null,
      });
    }
  }

  return NextResponse.json(
    (users || []).map((profile) => ({
      ...profile,
      latest_sanction: latestSanctionByUserId.get(profile.id) || null,
    }))
  );
}
