import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

/** IconTooltipButton에 전달하는 props */
type IconTooltipButtonProps = {
    /** lucide-react 아이콘 컴포넌트 */
    icon: LucideIcon;
    /** 아이콘 추가 className (색상 등) */
    iconClassName?: string;
    /** 툴팁에 표시할 레이블 텍스트 */
    label: string;
    /** 툴팁 위치. left: 왼쪽 정렬, right: 오른쪽 정렬 */
    tooltipAlign?: "left" | "right";
    /** 클릭 핸들러 */
    onClick?: () => void;
    /** 비활성 상태 */
    disabled?: boolean;
};

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
