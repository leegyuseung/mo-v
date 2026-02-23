"use client";

import { Button } from "@/components/ui/button";
import type { IconTooltipButtonProps } from "@/types/common";

/**
 * 아이콘 버튼 + hover 시 툴팁을 표시하는 공통 컴포넌트.
 * crew-detail, group-detail, vlist-detail 등 상세 화면의 액션 버튼에서 사용한다.
 */
export default function IconTooltipButton({
    icon: Icon,
    iconClassName = "",
    label,
    tooltipAlign = "right",
    onClick,
    disabled = false,
}: IconTooltipButtonProps) {
    /* 툴팁 정렬: 왼쪽 정렬은 left-1/2 -translate-x-1/2, 오른쪽 정렬은 right-1/2 translate-x-1/2 */
    const tooltipPositionClass =
        tooltipAlign === "left"
            ? "left-1/2 -translate-x-1/2"
            : "right-1/2 translate-x-1/2";

    return (
        <div className="group relative">
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="cursor-pointer h-10 w-10"
                onClick={onClick}
                disabled={disabled}
            >
                <Icon className={`w-5 h-5 ${iconClassName}`} />
            </Button>
            <span
                className={`pointer-events-none absolute ${tooltipPositionClass} top-full z-20 mt-1 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100`}
            >
                {label}
            </span>
        </div>
    );
}
