/**
 * 약관 미동의 사용자를 약관 동의 페이지로 리다이렉트하는 미들웨어.
 *
 * 소셜 로그인 사용자는 회원가입 시 약관 동의 단계가 없으므로,
 * 서비스 접근 시 필수 약관 동의 여부를 검증하여 미동의 시 /auth/agreements로 보낸다.
 * 인증/콜백/법적 고지 등 약관 없이 접근 가능한 경로는 바이패스한다.
 */
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

/** 약관 동의 없이 접근 허용되는 경로인지 확인한다 */
function isBypassPath(pathname: string) {
  return (
    pathname.startsWith("/auth/agreements") ||
    pathname.startsWith("/auth/callback") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/findpw") ||
    pathname.startsWith("/legal")
  );
}

/** 원래 요청 경로를 보존하여 약관 동의 후 복귀할 경로를 생성한다 */
function buildNextPath(request: NextRequest) {
  return `${request.nextUrl.pathname}${request.nextUrl.search || ""}`;
}

/** 리다이렉트 응답에 Supabase 세션 쿠키를 유지하기 위해 쿠키를 복사한다 */
function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value, cookie);
  });
}

export async function middleware(request: NextRequest) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next();
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return response;
  }

  if (isBypassPath(request.nextUrl.pathname)) {
    return response;
  }

  const { data: agreement, error } = await supabase
    .from("user_agreements")
    .select("terms_accepted,privacy_accepted,third_party_accepted")
    .eq("user_id", user.id)
    .maybeSingle();

  // 테이블 미생성(42P01) 또는 일시 오류 시에는 서비스 접근을 막지 않는다.
  if (error) {
    return response;
  }

  const isRequiredAccepted = Boolean(
    agreement?.terms_accepted && agreement?.privacy_accepted && agreement?.third_party_accepted
  );
  if (isRequiredAccepted) {
    return response;
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = "/auth/agreements";
  redirectUrl.search = "";
  redirectUrl.searchParams.set("next", buildNextPath(request));

  const redirectResponse = NextResponse.redirect(redirectUrl);
  copyCookies(response, redirectResponse);
  return redirectResponse;
}

export const config = {
  matcher: [
    // 정적 자원/API 경로 제외
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
