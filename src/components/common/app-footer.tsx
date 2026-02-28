import Link from "next/link";

export default function AppFooter() {
  return (
    <footer className="w-full border-t border-gray-100 py-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-2 px-4">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-gray-500">
          <Link href="/legal/terms" className="hover:text-gray-700 hover:underline">
            서비스 이용약관
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/legal/privacy" className="hover:text-gray-700 hover:underline">
            개인정보 수집·이용
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/legal/third-party" className="hover:text-gray-700 hover:underline">
            개인정보 처리위탁
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/legal/marketing" className="hover:text-gray-700 hover:underline">
            마케팅 수신 동의
          </Link>
        </div>

        <p className="text-center text-[11px] text-gray-400">
          본 사이트에 사용된 이미지, 영상, 로고, 상표 등 각 저작물의 권리는 원저작권자에게 있습니다.
        </p>
        <p className="text-center text-[11px] text-gray-400">
          권리 침해가 우려되는 콘텐츠는 문의해 주시면 검토 후 신속히 조치하겠습니다.
        </p>
        <p className="text-xs text-gray-500">
          문의사항:{" "}
          <a href="mailto:contact@mo-v.kr" className="transition-colors hover:text-gray-700">
            contact@mo-v.kr
          </a>
        </p>
        <p className="text-xs text-gray-400">© 2026 mo-v. All rights reserved.</p>
      </div>
    </footer>
  );
}
