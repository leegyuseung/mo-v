"use client";

import { useState } from "react";
import { AlertTriangle, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Pagination from "@/components/common/pagination";
import ProfileRequestCard from "@/components/screens/profile/profile-request-card";
import ProfileRequestsFilterButtons from "@/components/screens/profile/profile-requests-filter-buttons";
import { useAuthStore } from "@/store/useAuthStore";
import { useCancelMyRequest } from "@/hooks/mutations/profile/use-cancel-my-request";
import { useMyRequestHistory } from "@/hooks/queries/profile/use-my-request-history";
import { useProfileRequestsList } from "@/hooks/profile/use-profile-requests-list";
import type { CombinedRequest } from "@/types/profile";

type ProfileRequestsScreenProps = {
  embedded?: boolean;
};

const ITEMS_PER_PAGE = 10;

export default function ProfileRequestsScreen({ embedded = false }: ProfileRequestsScreenProps) {
  const { user, isLoading: isAuthLoading } = useAuthStore();
  const { data, isLoading, isError, refetch } = useMyRequestHistory(user?.id);
  const { mutateAsync: cancelMyRequest, isPending: isCancelling } = useCancelMyRequest();
  const [cancellingRequestKey, setCancellingRequestKey] = useState<string | null>(null);
  const {
    filter,
    setPage,
    handleFilterChange,
    pagedRequests,
    currentPage,
    totalPages,
    registrationCount,
    infoEditCount,
    reportCount,
    liveBoxCount,
    totalCount,
  } = useProfileRequestsList(data, ITEMS_PER_PAGE);

  const containerClass = embedded ? "w-full" : "max-w-4xl mx-auto p-6 mt-4";

  const handleCancelRequest = async (request: CombinedRequest) => {
    if (!user || request.status !== "pending") return;

    const requestKey = `${request.kind}-${request.id}`;
    setCancellingRequestKey(requestKey);
    try {
      await cancelMyRequest({
        requestId: request.id,
        requestKind: request.kind,
        infoEditSource: request.kind === "info-edit" ? request.source : undefined,
        userId: user.id,
      });
    } finally {
      setCancellingRequestKey(null);
    }
  };

  if (isAuthLoading) {
    return (
      <div className={containerClass}>
        <div className="mt-2 flex gap-2">
          <Skeleton className="h-11 w-40 rounded-xl" />
          <Skeleton className="h-11 w-40 rounded-xl" />
          <Skeleton className="h-11 w-36 rounded-xl" />
        </div>
        <div className="mt-6 space-y-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={containerClass}>
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center">
          <UserRound className="mx-auto mb-3 h-12 w-12 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-700">로그인이 필요합니다</h2>
          <p className="mt-2 text-sm text-gray-500">요청 내역을 확인하려면 먼저 로그인해 주세요.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={containerClass}>
        <div className="mt-2 flex gap-2">
          <Skeleton className="h-11 w-40 rounded-xl" />
          <Skeleton className="h-11 w-40 rounded-xl" />
          <Skeleton className="h-11 w-36 rounded-xl" />
        </div>
        <div className="mt-6 space-y-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className={containerClass}>
        <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
          <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-red-400" />
          <h2 className="text-lg font-semibold text-red-700">요청 내역을 불러오지 못했습니다.</h2>
          <Button
            type="button"
            onClick={() => refetch()}
            variant="outline"
            className="mt-4 cursor-pointer border-red-200 text-red-700 hover:bg-red-100"
          >
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <ProfileRequestsFilterButtons
        filter={filter}
        totalCount={totalCount}
        registrationCount={registrationCount}
        infoEditCount={infoEditCount}
        reportCount={reportCount}
        liveBoxCount={liveBoxCount}
        onFilterChange={handleFilterChange}
      />

      {pagedRequests.length ? (
        <div className="space-y-3">
          {pagedRequests.map((request) => (
            <ProfileRequestCard
              key={`${request.kind}-${request.id}`}
              request={request}
              onCancelRequest={handleCancelRequest}
              isCancelling={isCancelling && cancellingRequestKey === `${request.kind}-${request.id}`}
            />
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-gray-50 px-4 py-6 text-sm text-gray-500">요청 내역이 없습니다.</p>
      )}

      <Pagination
        page={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
      />
    </div>
  );
}
