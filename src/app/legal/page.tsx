import Link from "next/link";

const LEGAL_LINKS = [
  { href: "/legal/terms", label: "서비스 이용약관" },
  { href: "/legal/privacy", label: "개인정보 수집·이용" },
  { href: "/legal/third-party", label: "개인정보 처리위탁" },
  { href: "/legal/marketing", label: "마케팅 수신 동의" },
];

export default function LegalHomePage() {
  return (
    <section className="mx-auto w-full max-w-4xl p-4 md:p-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 md:p-8">
        <h1 className="mb-4 text-xl font-bold text-gray-900 md:text-2xl">약관 및 정책</h1>
        <p className="mb-6 text-sm text-gray-600">
          서비스 이용에 필요한 약관과 개인정보 관련 정책을 확인할 수 있습니다.
        </p>
        <div className="grid gap-3">
          {LEGAL_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
