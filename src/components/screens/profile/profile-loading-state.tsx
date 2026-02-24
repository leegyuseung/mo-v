import { Skeleton } from "@/components/ui/skeleton";

type ProfileLoadingStateProps = {
  className: string;
};

/** 프로필 화면 초기 로딩 스켈레톤 */
export default function ProfileLoadingState({ className }: ProfileLoadingStateProps) {
  return (
    <div className={className}>
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="space-y-8">
        <div className="rounded-2xl bg-gray-50 p-6">
          <Skeleton className="mb-4 h-4 w-20" />
          <div className="flex items-center gap-6">
            <Skeleton className="h-28 w-28 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-3 w-28" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-11 w-full" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="rounded-2xl border border-gray-100 p-4 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
