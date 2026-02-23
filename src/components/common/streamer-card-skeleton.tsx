import { Skeleton } from "@/components/ui/skeleton";

/**
 * 스트리머 카드 로딩 스켈레톤 컴포넌트.
 * home-screen, vlist-screen 등에서 데이터 로딩 중 표시한다.
 */
export default function StreamerCardSkeleton() {
    return (
        <div className="rounded-xl border border-gray-100 bg-white p-2.5 shadow-sm">
            <Skeleton className="mb-2 h-28 w-full rounded-lg" />
            <div className="mb-1 flex items-center justify-between gap-1">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12 rounded-full" />
            </div>
            <div className="mt-1 flex flex-wrap gap-1.5">
                <Skeleton className="h-4 w-14 rounded-full" />
                <Skeleton className="h-4 w-12 rounded-full" />
            </div>
        </div>
    );
}
