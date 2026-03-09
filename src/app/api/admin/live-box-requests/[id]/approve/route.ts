import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import type { LiveBoxCreateInput } from "@/types/live-box";
import { isAdminRole } from "@/utils/role";
import { assertValidLiveBoxPayload } from "@/utils/admin-live-box";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return NextResponse.json(
      { message: "서버 설정이 올바르지 않습니다." },
      { status: 500 }
    );
  }

  const { id } = await params;
  const requestId = Number(id);
  if (!Number.isFinite(requestId) || requestId <= 0) {
    return NextResponse.json({ message: "요청 ID가 올바르지 않습니다." }, { status: 400 });
  }

  let payload: LiveBoxCreateInput;
  try {
    payload = (await request.json()) as LiveBoxCreateInput;
    assertValidLiveBoxPayload(payload);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "박스 등록 정보가 올바르지 않습니다.";
    return NextResponse.json({ message }, { status: 400 });
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

  if (meError || !me || !isAdminRole(me.role)) {
    return NextResponse.json({ message: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const admin = createAdminClient(supabaseUrl, serviceRoleKey);

  const { data: pendingRequest, error: pendingRequestError } = await admin
    .from("live_box_requests")
    .select("*")
    .eq("id", requestId)
    .eq("status", "pending")
    .maybeSingle();

  if (pendingRequestError) {
    return NextResponse.json(
      { message: "대기 중인 박스 등록 요청을 찾지 못했습니다." },
      { status: 500 }
    );
  }

  if (!pendingRequest) {
    return NextResponse.json(
      { message: "대기 중인 박스 등록 요청이 없습니다." },
      { status: 404 }
    );
  }

  /**
   * 승인과 실제 박스 생성을 DB 함수로 묶는다.
   * 왜: 애플리케이션 레벨에서 두 쿼리를 따로 실행하면 중간 실패 시 불일치 상태가 남을 수 있기 때문이다.
   */
  const { data: liveBoxId, error: approveError } = await admin.rpc(
    "approve_live_box_request",
    {
      p_request_id: requestId,
      p_reviewer_id: user.id,
      p_title: payload.title,
      p_category: payload.category,
      p_participant_streamer_ids: payload.participant_streamer_ids,
      p_starts_at: payload.starts_at,
      p_ends_at: payload.ends_at,
      p_url_title: payload.url_title,
      p_url: payload.url,
      p_description: payload.description,
      p_status: payload.status,
    }
  );

  if (approveError || !liveBoxId) {
    return NextResponse.json(
      { message: "라이브박스 승인 처리에 실패했습니다. 승인 RPC SQL 적용 여부를 확인해 주세요." },
      { status: 500 }
    );
  }

  const { data: createdLiveBox, error: liveBoxError } = await admin
    .from("live_box")
    .select("*")
    .eq("id", liveBoxId)
    .single();

  const { data: updatedRequest, error: updateRequestError } = await admin
    .from("live_box_requests")
    .select("*")
    .eq("id", requestId)
    .single();

  if (liveBoxError || !createdLiveBox || updateRequestError || !updatedRequest) {
    return NextResponse.json(
      { message: "승인 처리 결과를 다시 확인하지 못했습니다." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    liveBox: createdLiveBox,
    request: updatedRequest,
  });
}
