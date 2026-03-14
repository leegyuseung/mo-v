import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { isAdminRole } from "@/utils/role";
import type {
  AdminStreamerPageParams,
  AdminStreamerPageResponse,
} from "@/types/admin-streamer";
import type { Streamer } from "@/types/streamer";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getBirthdaySortValue(birthday?: string | null) {
  if (!birthday) return Number.MAX_SAFE_INTEGER;

  const matched = birthday.match(/(\d{1,2})\D+(\d{1,2})/);
  if (!matched) return Number.MAX_SAFE_INTEGER;

  const month = Number(matched[1]);
  const day = Number(matched[2]);
  if (!month || !day) return Number.MAX_SAFE_INTEGER;
  return month * 100 + day;
}

function getFirstStreamDateSortValue(firstStreamDate?: string | null) {
  if (!firstStreamDate) return Number.MAX_SAFE_INTEGER;

  const matched = firstStreamDate.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
  if (!matched) return Number.MAX_SAFE_INTEGER;

  const year = Number(matched[1]);
  const month = Number(matched[2]);
  const day = Number(matched[3]);
  if (!year || !month || !day) return Number.MAX_SAFE_INTEGER;

  return year * 10000 + month * 100 + day;
}

function parsePageParams(request: NextRequest): AdminStreamerPageParams {
  const searchParams = request.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get("page") || "1"));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || "20")));
  const keyword = searchParams.get("keyword") || "";
  const platform = (searchParams.get("platform") || "all") as AdminStreamerPageParams["platform"];
  const genre = searchParams.get("genre") || "all";
  const sortKey = (searchParams.get("sortKey") || "createdAt") as AdminStreamerPageParams["sortKey"];
  const sortOrder = (searchParams.get("sortOrder") || "desc") as AdminStreamerPageParams["sortOrder"];

  return {
    page,
    pageSize,
    keyword,
    platform,
    genre,
    sortKey,
    sortOrder,
  };
}

export async function GET(request: NextRequest) {
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    return NextResponse.json({ message: "서버 설정이 올바르지 않습니다." }, { status: 500 });
  }

  const params = parsePageParams(request);
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
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (meError || !me || !isAdminRole(me.role)) {
    return NextResponse.json({ message: "관리자 권한이 필요합니다." }, { status: 403 });
  }

  const admin = createAdminClient(supabaseUrl, serviceRoleKey);

  /**
   * 생일순은 DB 정렬로 바로 표현하기 어려워 서버에서 정렬 후 잘라낸다.
   * 왜: 클라이언트로 전체 목록을 내려 보내지 않고도 현재 요구 정렬을 유지하기 위해서다.
   */
  if (params.sortKey === "birthday" || params.sortKey === "firstStreamDate") {
    let query = admin.from("streamers").select("*", { count: "exact" });
    if (params.platform !== "all") {
      query = query.eq("platform", params.platform);
    }
    if (params.genre !== "all") {
      query = query.contains("genre", [params.genre]);
    }
    if (params.keyword.trim()) {
      query = query.ilike("nickname", `%${params.keyword.trim()}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json({ message: "버츄얼 목록 조회에 실패했습니다." }, { status: 500 });
    }

    const sorted = [...((data || []) as Streamer[])].sort((left, right) => {
      const primaryDiff =
        params.sortKey === "birthday"
          ? getBirthdaySortValue(left.birthday) - getBirthdaySortValue(right.birthday)
          : getFirstStreamDateSortValue(left.first_stream_date) -
            getFirstStreamDateSortValue(right.first_stream_date);
      if (primaryDiff !== 0) {
        return params.sortOrder === "asc" ? primaryDiff : primaryDiff * -1;
      }
      const nameDiff = (left.nickname || "").localeCompare(right.nickname || "", "ko");
      return params.sortOrder === "asc" ? nameDiff : nameDiff * -1;
    });

    const from = (params.page - 1) * params.pageSize;
    const to = from + params.pageSize;
    const response: AdminStreamerPageResponse = {
      data: sorted.slice(from, to),
      count: count || 0,
    };

    return NextResponse.json(response);
  }

  const orderColumn = params.sortKey === "name" ? "nickname" : "created_at";
  const ascending = params.sortOrder === "asc";
  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;

  let query = admin
    .from("streamers")
    .select("*", { count: "exact" })
    .order(orderColumn, { ascending, nullsFirst: false })
    .range(from, to);
  if (params.platform !== "all") {
    query = query.eq("platform", params.platform);
  }
  if (params.genre !== "all") {
    query = query.contains("genre", [params.genre]);
  }
  if (params.keyword.trim()) {
    query = query.ilike("nickname", `%${params.keyword.trim()}%`);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ message: "버츄얼 목록 조회에 실패했습니다." }, { status: 500 });
  }

  const response: AdminStreamerPageResponse = {
    data: (data || []) as Streamer[],
    count: count || 0,
  };

  return NextResponse.json(response);
}
