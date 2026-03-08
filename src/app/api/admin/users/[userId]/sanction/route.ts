import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { hasAdminAccess, isAdminRole, normalizeRole } from "@/utils/role";
import { isValidUUID } from "@/utils/validate";
import { consumeRouteRateLimit, getRequestClientIp } from "@/utils/route-rate-limit";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type SanctionRequestBody =
  | {
      action: "suspend";
      durationDays: number | null;
      reason: string;
      internalNote?: string;
    }
  | {
      action: "unsuspend";
      reason?: string;
      internalNote?: string;
    };

const MAX_REASON_LENGTH = 500;
const MAX_INTERNAL_NOTE_LENGTH = 1000;

function getSuspendedUntilIso(durationDays: number | null) {
  if (durationDays === null) return null;

  return new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString();
}

export async function POST(
  request: Request,
  context: { params: Promise<{ userId: string }> }
) {
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return NextResponse.json(
      { message: "서버 설정이 올바르지 않습니다." },
      { status: 500 }
    );
  }

  const { userId } = await context.params;
  if (!userId || !isValidUUID(userId)) {
    return NextResponse.json({ message: "유효하지 않은 유저 ID입니다." }, { status: 400 });
  }

  let body: SanctionRequestBody;
  try {
    body = (await request.json()) as SanctionRequestBody;
  } catch {
    return NextResponse.json({ message: "잘못된 요청 본문입니다." }, { status: 400 });
  }

  /* action 필드 명시적 검증 */
  if (body.action !== "suspend" && body.action !== "unsuspend") {
    return NextResponse.json({ message: "지원하지 않는 액션입니다." }, { status: 400 });
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

  const rateLimit = consumeRouteRateLimit({
    key: `admin-user-sanction:${user.id}:${getRequestClientIp(request)}`,
    limit: 20,
    windowMs: 60 * 1000,
  });

  if (!rateLimit.ok) {
    return NextResponse.json(
      { message: "요청이 많습니다. 잠시 후 다시 시도해 주세요." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  if (user.id === userId) {
    return NextResponse.json(
      { message: "본인 계정은 정지/해제할 수 없습니다." },
      { status: 400 }
    );
  }

  const admin = createAdminClient(supabaseUrl, serviceRoleKey);
  const { data: targetProfile, error: targetError } = await admin
    .from("profiles")
    .select("id, role, account_status")
    .eq("id", userId)
    .maybeSingle();

  if (targetError) {
    return NextResponse.json({ message: "대상 유저 조회에 실패했습니다." }, { status: 500 });
  }

  if (!targetProfile) {
    return NextResponse.json({ message: "대상 유저를 찾을 수 없습니다." }, { status: 404 });
  }

  const myRole = normalizeRole(me.role);
  const targetRole = normalizeRole(targetProfile.role);

  if (targetRole === "admin") {
    return NextResponse.json(
      { message: "admin 계정은 정지/해제할 수 없습니다." },
      { status: 403 }
    );
  }

  if (!isAdminRole(me.role) && targetRole !== "user") {
    return NextResponse.json(
      { message: "manager는 일반 유저만 관리할 수 있습니다." },
      { status: 403 }
    );
  }

  /* ── unsuspend (정지 해제) ── */
  if (body.action === "unsuspend") {
    if (targetProfile.account_status === "active") {
      return NextResponse.json({ message: "이미 정상 상태인 계정입니다." }, { status: 400 });
    }

    if ((body.reason || "").trim().length > MAX_REASON_LENGTH) {
      return NextResponse.json({ message: "해제 사유가 너무 깁니다." }, { status: 400 });
    }

    if ((body.internalNote || "").trim().length > MAX_INTERNAL_NOTE_LENGTH) {
      return NextResponse.json({ message: "내부 메모가 너무 깁니다." }, { status: 400 });
    }

    const reason = (body.reason || "관리자 해제").trim();
    const internalNote = body.internalNote?.trim() || null;

    const { error: rpcError } = await admin.rpc("manage_user_sanction", {
      p_user_id: userId,
      p_action_type: "unsuspend",
      p_account_status: "active",
      p_duration_days: null,
      p_reason: reason,
      p_internal_note: internalNote,
      p_suspended_until: null,
      p_created_by: user.id,
    });

    if (rpcError) {
      return NextResponse.json({ message: "제재 해제 처리에 실패했습니다." }, { status: 500 });
    }

    return NextResponse.json({ success: true, status: "active" });
  }

  /* ── suspend / ban (정지) ── */
  const reason = body.reason?.trim().slice(0, MAX_REASON_LENGTH);
  const internalNote = body.internalNote?.trim() || null;
  const durationDays = body.durationDays;
  const allowedDurations = [1, 3, 7, 30];

  if ((body.reason || "").trim().length > MAX_REASON_LENGTH) {
    return NextResponse.json({ message: "정지 사유가 너무 깁니다." }, { status: 400 });
  }

  if ((body.internalNote || "").trim().length > MAX_INTERNAL_NOTE_LENGTH) {
    return NextResponse.json({ message: "내부 메모가 너무 깁니다." }, { status: 400 });
  }

  if (!reason) {
    return NextResponse.json({ message: "정지 사유를 입력해 주세요." }, { status: 400 });
  }

  if (durationDays !== null && !allowedDurations.includes(durationDays)) {
    return NextResponse.json({ message: "지원하지 않는 정지 기간입니다." }, { status: 400 });
  }

  if (durationDays === null && myRole !== "admin") {
    return NextResponse.json(
      { message: "영구 정지는 admin만 처리할 수 있습니다." },
      { status: 403 }
    );
  }

  const suspendedUntil = getSuspendedUntilIso(durationDays);
  const nextStatus = durationDays === null ? "banned" : "suspended";

  const { error: rpcError } = await admin.rpc("manage_user_sanction", {
    p_user_id: userId,
    p_action_type: durationDays === null ? "ban" : "suspend",
    p_account_status: nextStatus,
    p_duration_days: durationDays,
    p_reason: reason,
    p_internal_note: internalNote,
    p_suspended_until: suspendedUntil,
    p_created_by: user.id,
  });

  if (rpcError) {
    return NextResponse.json({ message: "계정 정지 처리에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    status: nextStatus,
    suspendedUntil,
  });
}
