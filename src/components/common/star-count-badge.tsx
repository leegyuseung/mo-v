import { Star } from "lucide-react";

/**
 * 즐겨찾기 수를 표시하는 공통 배지 컴포넌트.
 * vlist-detail, group-detail, crew-detail에서 동일하게 사용되던 패턴을 통합한다.
 */
export default function StarCountBadge({
    count,
    isLoading,
}: {
    count: number;
    isLoading: boolean;
}) {
    return (
        <div className="inline-flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </span>
            <span className="text-sm font-semibold text-gray-800">
                {isLoading ? "-" : count.toLocaleString()}
            </span>
        </div>
    );
}
