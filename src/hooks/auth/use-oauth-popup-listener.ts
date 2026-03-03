import { useEffect } from "react";

/**
 * 소셜 로그인 팝업에서 전달되는 postMessage를 수신하여 페이지를 이동시킨다.
 *
 * 소셜 로그인을 팝업 방식으로 처리하는 이유:
 * - 현재 페이지(로그인 폼)의 상태를 유지한 채 OAuth 인증을 진행하기 위함
 * - 팝업 차단 시에는 login-screen에서 fallback으로 전체 페이지 리디렉트 처리
 */
export function useOAuthPopupListener() {
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      const data = event.data as { type?: string; nextPath?: string } | null;
      if (!data?.type) return;
      if (data.type !== "oauth-popup-complete" && data.type !== "oauth-popup-agreements") return;

      const targetPath = data.nextPath || "/";
      window.location.assign(targetPath);
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);
}
