import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { deleteUserCompletely } from "@/utils/user-cleanup";
import { hasAdminAccess, isAdminRole, isAppRole } from "@/utils/role";
import { isValidUUID } from "@/utils/validate";
import type { AppRole } from "@/types/app-role";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type RouteContext = { params: Promise<{ userId: string }> };

/** 요청자의 인증 + admin 권한을 확인하고 Supabase 클라이언트를 반환한다 */
async function authenticateAdmin() {
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return { error: NextResponse.json({ message: "서버 설정이 올바르지 않습니다." }, { status: 500 }) } as const;
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
    data: { user: caller },
    error: callerError,
  } = await supabase.auth.getUser();

  if (callerError || !caller) {
    return { error: NextResponse.json({ message: "인증된 사용자 정보를 확인할 수 없습니다." }, { status: 401 }) } as const;
  }

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", caller.id)
    .single();

  if (!callerProfile || !hasAdminAccess(callerProfile.role)) {
    return { error: NextResponse.json({ message: "관리자 권한이 필요합니다." }, { status: 403 }) } as const;
  }

  const admin = createAdminClient(supabaseUrl, serviceRoleKey);

  return { caller, callerProfile, admin, error: null } as const;
}

/** userId 파라미터를 추출하고 UUID 형식을 검증한다 */
async function validateUserId(context: RouteContext) {
  const { userId } = await context.params;
  if (!userId || !isValidUUID(userId)) {
    return { userId: null, error: NextResponse.json({ message: "유효하지 않은 유저 ID입니다." }, { status: 400 }) } as const;
  }
  return { userId, error: null } as const;
}

/** Admin 전용 회원 삭제 API — 참조 데이터 정리 후 Auth 계정까지 삭제한다. */
export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  const auth = await authenticateAdmin();
  if (auth.error) return auth.error;

  const param = await validateUserId(context);
  if (param.error) return param.error;

  /* 본인 계정 삭제 방지 */
  if (auth.caller.id === param.userId) {
    return NextResponse.json({ message: "본인 계정은 삭제할 수 없습니다." }, { status: 400 });
  }

  try {
    await deleteUserCompletely(auth.admin, param.userId);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ message: "회원 삭제 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}

/**
 * Admin 전용 유저 정보 수정 API.
 * role, bio를 서버 사이드에서 권한 검증 후 업데이트한다.
 * role 변경은 admin만 가능하며, 자기 자신의 role은 변경할 수 없다.
 */
export async function PATCH(
  request: Request,
  context: RouteContext
) {
  const auth = await authenticateAdmin();
  if (auth.error) return auth.error;

  const param = await validateUserId(context);
  if (param.error) return param.error;

  let body: { nickname?: unknown; role?: unknown; bio?: unknown };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ message: "잘못된 요청 본문입니다." }, { status: 400 });
  }

  /* 필드별 검증 */
  if (body.nickname !== undefined) {
    return NextResponse.json(
      { message: "유저관리에서는 닉네임을 변경할 수 없습니다." },
      { status: 400 }
    );
  }

  let validatedRole: AppRole | undefined;
  if (body.role !== undefined) {
    if (typeof body.role !== "string" || !isAppRole(body.role)) {
      return NextResponse.json({ message: "지원하지 않는 역할입니다." }, { status: 400 });
    }
    /* role 변경은 admin만 가능 */
    if (!isAdminRole(auth.callerProfile.role)) {
      return NextResponse.json({ message: "역할 변경은 admin만 가능합니다." }, { status: 403 });
    }
    /* 자기 자신의 role 변경 방지 (admin 강등 사고 방지) */
    if (auth.caller.id === param.userId) {
      return NextResponse.json({ message: "본인의 역할은 변경할 수 없습니다." }, { status: 400 });
    }
    validatedRole = body.role;
  }

  const validatedBio = typeof body.bio === "string" ? body.bio : undefined;

  if (validatedRole === undefined && validatedBio === undefined) {
    return NextResponse.json({ message: "변경할 항목이 없습니다." }, { status: 400 });
  }

  /* role/bio 변경 */
  const shouldUpdateColumns = validatedRole !== undefined || validatedBio !== undefined;
  if (shouldUpdateColumns) {
    const updatePayload: { role?: AppRole; bio?: string; updated_at: string } = {
      updated_at: new Date().toISOString(),
    };
    if (validatedRole !== undefined) updatePayload.role = validatedRole;
    if (validatedBio !== undefined) updatePayload.bio = validatedBio;

    const { error: updateError } = await auth.admin
      .from("profiles")
      .update(updatePayload)
      .eq("id", param.userId);
    if (updateError) {
      return NextResponse.json({ message: "유저 정보 수정에 실패했습니다." }, { status: 500 });
    }
  }

  /* 업데이트된 프로필 반환 */
  const { data, error } = await auth.admin
    .from("profiles")
    .select("*")
    .eq("id", param.userId)
    .single();

  if (error) {
    return NextResponse.json({ message: "수정된 프로필 조회에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json(data);
}
