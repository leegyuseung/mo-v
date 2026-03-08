"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import type { IconTooltipButtonProps } from "@/types/common";
import { cn } from "@/lib/utils";

/**
 * 아이콘 버튼 + hover 시 툴팁을 표시하는 공통 컴포넌트.
 * crew-detail, group-detail, vlist-detail 등 상세 화면의 액션 버튼에서 사용한다.
 */
export default function IconTooltipButton({
    icon: Icon,
    iconClassName = "",
    buttonClassName,
    label,
    tooltipAlign = "right",
    onClick,
    disabled = false,
    ariaLabel,
}: IconTooltipButtonProps) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn("h-10 w-10 cursor-pointer", buttonClassName)}
                    onClick={onClick}
                    disabled={disabled}
                    aria-label={ariaLabel || label}
                >
                    <Icon className={cn("h-5 w-5", iconClassName)} />
                </Button>
            </TooltipTrigger>
            <TooltipContent align={tooltipAlign === "left" ? "start" : "end"}>
                <p>{label}</p>
            </TooltipContent>
        </Tooltip>
    );
}
