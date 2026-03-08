/**
 * OAuth 콜백 라우트.
 *
 * 소셜 로그인을 팝업으로 처리하기 때문에, 인증 완료 후 팝업 → 부모 창으로
 * postMessage를 보내는 HTML을 응답한다. 팝업이 아닌 경우에는 일반 리다이렉트를 수행한다.
 * 약관 미동의 사용자는 /auth/agreements로 분기한다.
 */
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { sanitizeAgreementNextPath } from "@/lib/user-agreement";
import { getAccountRestrictionMessage } from "@/utils/account-status";
import {
  ACCOUNT_RESTRICTED_COOKIE_KEY,
  type AccountRestrictedPayload,
} from "@/lib/account-restricted";

/**
 * 팝업 완료 시 부모 창에 postMessage를 보내고 자신을 닫는 HTML을 생성한다.
 * 팝업이 차단되었거나 opener가 없는 경우 fallback으로 직접 리디렉트한다.
 */
function createPopupCompleteResponse({
  origin,
  messageType,
  nextPath,
  restrictedPayload,
}: {
  origin: string;
  messageType: "oauth-popup-complete" | "oauth-popup-agreements";
  nextPath: string;
  restrictedPayload?: AccountRestrictedPayload | null;
}) {
  const safeOrigin = JSON.stringify(origin);
  const safeType = JSON.stringify(messageType);
  const safeNextPath = JSON.stringify(nextPath);
  const fallbackUrl = JSON.stringify(`${origin}${nextPath}`);
  const cookieScript = restrictedPayload
    ? `document.cookie = ${JSON.stringify(
        `${ACCOUNT_RESTRICTED_COOKIE_KEY}=${encodeURIComponent(
          JSON.stringify({
            status: restrictedPayload.status || "",
            suspended_until: restrictedPayload.suspended_until || "",
            reason: restrictedPayload.reason || "",
          })
        )}; path=/; max-age=300; samesite=lax`
      )};`
    : "";
  const html = `<!doctype html>
<html>
  <head><meta charset="utf-8" /></head>
  <body>
    <script>
      try {
        ${cookieScript}
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage({ type: ${safeType}, nextPath: ${safeNextPath} }, ${safeOrigin});
        } else {
          window.location.replace(${fallbackUrl});
        }
      } catch (e) {}
      try { window.close(); } catch (e) {}
    </script>
  </body>
</html>`;
  return new NextResponse(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const isPopup = searchParams.get("popup") === "1";
    const nextPath = sanitizeAgreementNextPath(searchParams.get("next"));

    if (code) {
        const cookieStore = await cookies();
        const supabase = createClient(cookieStore);
        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error) {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            let isRequiredAgreementAccepted = false;
            if (user) {
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("account_status,suspended_until,suspension_reason")
                    .eq("id", user.id)
                    .maybeSingle();

                const restrictionMessage = getAccountRestrictionMessage(profile);
                if (restrictionMessage) {
                    await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
                    const restrictedPayload = {
                        status: profile?.account_status || "suspended",
                        suspended_until: profile?.suspended_until || "",
                        reason: profile?.suspension_reason || "",
                    };
                    const restrictedUrl = new URL("/account-restricted", origin);

                    if (isPopup) {
                        return createPopupCompleteResponse({
                            origin,
                            messageType: "oauth-popup-complete",
                            nextPath: restrictedUrl.pathname,
                            restrictedPayload,
                        });
                    }

                    const response = NextResponse.redirect(restrictedUrl);
                    response.cookies.set(
                        ACCOUNT_RESTRICTED_COOKIE_KEY,
                        encodeURIComponent(JSON.stringify(restrictedPayload)),
                        {
                            httpOnly: false,
                            maxAge: 60 * 5,
                            path: "/",
                            sameSite: "lax",
                        }
                    );
                    return response;
                }

                const { data: agreement } = await supabase
                    .from("user_agreements")
                    .select("terms_accepted,privacy_accepted,third_party_accepted")
                    .eq("user_id", user.id)
                    .maybeSingle();
                isRequiredAgreementAccepted = Boolean(
                    agreement?.terms_accepted && agreement?.privacy_accepted && agreement?.third_party_accepted
                );
            }

            const redirectPath = isRequiredAgreementAccepted
                ? nextPath
                : `/auth/agreements?next=${encodeURIComponent(nextPath)}`;

            if (isPopup) {
                return createPopupCompleteResponse({
                    origin,
                    messageType: isRequiredAgreementAccepted
                        ? "oauth-popup-complete"
                        : "oauth-popup-agreements",
                    nextPath: redirectPath,
                });
            }

            return NextResponse.redirect(new URL(redirectPath, origin));
        }
    }

    // 에러 발생 시 로그인 페이지로 리다이렉트
    return NextResponse.redirect(`${origin}/login`);
}
