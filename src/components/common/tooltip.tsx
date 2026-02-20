"use client";

import type { ReactNode } from "react";

type TooltipPosition = "center" | "left" | "right";

/**
 * 호버 시 나타나는 미니 툴팁 컴포넌트.
 * 기존 프로젝트 전체에서 반복되던 `pointer-events-none absolute ... bg-gray-900` span 패턴을 대체한다.
 */
export default function Tooltip({
    children,
    label,
    position = "center",
}: {
    children: ReactNode;
    label: string;
    position?: TooltipPosition;
}) {
    const positionClass =
        position === "left"
            ? "left-1/2 -translate-x-1/2"
            : position === "right"
                ? "right-1/2 translate-x-1/2"
                : "left-1/2 -translate-x-1/2";

    return (
        <div className="group relative">
            {children}
            <span
                className={`pointer-events-none absolute top-full z-20 mt-1 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 ${positionClass}`}
            >
                {label}
            </span>
        </div>
    );
}
