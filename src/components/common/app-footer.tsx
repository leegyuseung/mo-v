export default function AppFooter() {
    return (
        <footer className="w-full py-6 flex flex-col gap-1.5 items-center justify-center border-t border-gray-100">
            <p className="text-xs text-gray-400">
                © 2026 mo-v. All rights reserved.
            </p>
            <p className="text-[11px] text-gray-400 text-center px-4">
                본 사이트에 사용된 이미지, 영상, 로고, 상표 등 각 저작물의 권리는 원저작권자에게 있습니다.
            </p>
            <p className="text-[11px] text-gray-400 text-center px-4">
                권리 침해가 우려되는 콘텐츠는 문의해 주시면 검토 후 신속히 조치하겠습니다.
            </p>
            <p className="text-xs text-gray-500">
                문의사항: <a href="mailto:contact@mo-v.kr" className="hover:text-gray-700 transition-colors">contact@mo-v.kr</a>
            </p>
        </footer>
    );
}
