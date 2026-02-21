export default function AppFooter() {
    return (
        <footer className="w-full py-6 flex flex-col gap-1.5 items-center justify-center border-t border-gray-100">
            <p className="text-xs text-gray-400">
                © 2026 mo-v. All rights reserved.
            </p>
            <p className="text-xs text-gray-500">
                문의사항: <a href="mailto:contact@mo-v.kr" className="hover:text-gray-700 transition-colors">contact@mo-v.kr</a>
            </p>
        </footer>
    );
}
