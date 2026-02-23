import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Pagination에 전달하는 props */
type PaginationProps = {
    /** 현재 페이지 번호 (1-based) */
    page: number;
    /** 전체 페이지 수 */
    totalPages: number;
    /** 페이지 변경 콜백 */
    onPageChange: (page: number) => void;
    /** 한 번에 표시할 페이지 번호 개수 (기본 5) */
    visibleCount?: number;
};

/**
 * 페이지 번호 + 이전/다음 버튼을 표시하는 공통 페이지네이션 컴포넌트.
 * live-screen, vlist-screen 등에서 재사용한다.
 */
export default function Pagination({
    page,
    totalPages,
    onPageChange,
    visibleCount = 5,
}: PaginationProps) {
    /** 현재 페이지 주변으로 표시할 페이지 번호 배열을 계산한다 */
    const pageNumbers = useMemo(() => {
        const half = Math.floor(visibleCount / 2);
        const start = Math.max(1, page - half);
        const end = Math.min(totalPages, start + visibleCount - 1);
        const adjustedStart = Math.max(1, end - visibleCount + 1);
        return Array.from(
            { length: end - adjustedStart + 1 },
            (_, i) => adjustedStart + i
        );
    }, [page, totalPages, visibleCount]);

    if (totalPages <= 1) return null;

    return (
        <div className="mt-8 flex items-center justify-center gap-1.5">
            <Button
                type="button"
                size="icon-sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => onPageChange(Math.max(1, page - 1))}
                className="cursor-pointer"
            >
                <ChevronLeft className="w-4 h-4" />
            </Button>

            {pageNumbers.map((num) => (
                <Button
                    key={num}
                    type="button"
                    size="sm"
                    variant={num === page ? "default" : "outline"}
                    onClick={() => onPageChange(num)}
                    className={`cursor-pointer ${num === page ? "bg-gray-800 hover:bg-gray-900 text-white" : ""
                        }`}
                >
                    {num}
                </Button>
            ))}

            <Button
                type="button"
                size="icon-sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                className="cursor-pointer"
            >
                <ChevronRight className="w-4 h-4" />
            </Button>
        </div>
    );
}
