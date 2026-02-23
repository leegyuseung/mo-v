import type { PlatformBadgeProps } from "@/types/common";

/**
 * 플랫폼 배지를 표시하는 공통 컴포넌트.
 * chzzk은 초록색, soop은 파란색 배지로 표시한다.
 * vlist, pending-screen 등 여러 화면에서 재사용된다.
 */
export default function PlatformBadge({
    platform,
    className = "",
}: PlatformBadgeProps) {
    const platformLower = platform.toLowerCase();
    const isChzzk = platformLower === "chzzk";
    const isSoop = platformLower === "soop";

    /** chzzk: 초록색 배지, soop: 파란색 배지, 그 외: 회색 배지 */
    const colorClass = isChzzk
        ? "bg-green-100 text-green-700"
        : isSoop
            ? "bg-blue-100 text-blue-700"
            : "bg-gray-100 text-gray-700";

    return (
        <span
            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${colorClass} ${className}`}
        >
            {platform.toUpperCase()}
        </span>
    );
}
