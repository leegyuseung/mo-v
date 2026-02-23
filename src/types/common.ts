import type { LucideIcon } from "lucide-react";

/** IconTooltipButton 컴포넌트에 전달하는 props */
export type IconTooltipButtonProps = {
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

/** Pagination 컴포넌트에 전달하는 props */
export type PaginationProps = {
    /** 현재 페이지 번호 (1-based) */
    page: number;
    /** 전체 페이지 수 */
    totalPages: number;
    /** 페이지 변경 콜백 */
    onPageChange: (page: number) => void;
    /** 한 번에 표시할 페이지 번호 개수 (기본 5) */
    visibleCount?: number;
};

/** PlatformBadge 컴포넌트에 전달하는 props */
export type PlatformBadgeProps = {
    /** 플랫폼 타입 (chzzk 또는 soop) */
    platform: "chzzk" | "soop" | string;
    /** 추가 className */
    className?: string;
};
