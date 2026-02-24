"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CirclePlus, FilePenLine, Siren, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Pagination from "@/components/common/pagination";
import { useAuthStore } from "@/store/useAuthStore";
import { useMyRequestHistory } from "@/hooks/queries/profile/use-my-request-history";
import type { MyEntityReportRequest } from "@/types/profile";

type ProfileRequestsScreenProps = {
  embedded?: boolean;
};

type RequestStatus = "pending" | "approved" | "rejected" | "cancelled";
type RequestFilter = "all" | "registration" | "info-edit" | "report";

type CombinedRequest =
  | {
      kind: "registration";
      id: number;
      created_at: string;
      reviewed_at: string | null;
      status: string;
      review_note: string | null;
      platform: string;
      platform_streamer_url: string;
    }
  | {
      kind: "info-edit";
      id: number;
      created_at: string;
      reviewed_at: string | null;
      status: string;
      review_note: string | null;
      streamer_nickname: string;
      content: string;
    }
  | {
      kind: "report";
      id: number;
      created_at: string;
      reviewed_at: string | null;
      status: string;
      review_note: string | null;
      target_type: string;
      target_name: string | null;
      target_code: string;
      content: string;
    };

const ITEMS_PER_PAGE = 10;

function normalizeStatus(status: string): RequestStatus {
  if (status === "approved") return "approved";
  if (status === "rejected") return "rejected";
  if (status === "cancelled") return "cancelled";
  return "pending";
}

function statusLabel(status: string) {
  const normalizedStatus = normalizeStatus(status);
  if (normalizedStatus === "approved") return "확인";
  if (normalizedStatus === "rejected") return "거절";
  if (normalizedStatus === "cancelled") return "취소";
  return "대기";
}

function statusClass(status: string) {
  const normalizedStatus = normalizeStatus(status);
  if (normalizedStatus === "approved") return "bg-emerald-100 text-emerald-700";
  if (normalizedStatus === "rejected") return "bg-red-100 text-red-700";
  if (normalizedStatus === "cancelled") return "bg-gray-200 text-gray-700";
  return "bg-amber-100 text-amber-700";
}

function formatDateTime(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("ko-KR");
}

function getInfoEditTargetLabel(streamerNickname: string) {
  if (streamerNickname.startsWith("[GROUP]")) return "정보 수정 요청 (그룹)";
  if (streamerNickname.startsWith("[CREW]")) return "정보 수정 요청 (소속)";
  return "정보 수정 요청 (버츄얼)";
}

function getReportTargetLabel(request: MyEntityReportRequest) {
  if (request.target_type === "group") return "신고 요청 (그룹)";
  if (request.target_type === "crew") return "신고 요청 (소속)";
  return "신고 요청 (버츄얼)";
}

function RequestCard({ request }: { request: CombinedRequest }) {
  if (request.kind === "registration") {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <CirclePlus className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium text-gray-800">버츄얼 추가 요청</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                  request.platform === "chzzk"
                    ? "bg-green-100 text-green-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {request.platform.toUpperCase()}
              </span>
            </div>
            <a
              href={request.platform_streamer_url}
              target="_blank"
              rel="noreferrer"
              className="block max-w-[620px] truncate text-sm text-blue-600 underline underline-offset-2"
              title={request.platform_streamer_url}
            >
              {request.platform_streamer_url}
            </a>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass(
              request.status
            )}`}
          >
            {statusLabel(request.status)}
          </span>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          요청일시: {formatDateTime(request.created_at)} | 처리일시:{" "}
          {formatDateTime(request.reviewed_at)}
        </div>

        {request.review_note ? (
          <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            거절 사유: {request.review_note}
          </p>
        ) : null}
      </div>
    );
  }

  if (request.kind === "info-edit") {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <FilePenLine className="h-4 w-4 text-indigo-500" />
              <span className="text-sm font-medium text-gray-800">
                {getInfoEditTargetLabel(request.streamer_nickname)}
              </span>
            </div>
            <p className="truncate text-xs text-gray-500">{request.streamer_nickname}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass(
              request.status
            )}`}
          >
            {statusLabel(request.status)}
          </span>
        </div>

        <p className="mt-2 whitespace-pre-wrap break-words rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
          {request.content}
        </p>
        <div className="mt-2 text-xs text-gray-500">
          요청일시: {formatDateTime(request.created_at)} | 처리일시:{" "}
          {formatDateTime(request.reviewed_at)}
        </div>
        {request.review_note ? (
          <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            거절 사유: {request.review_note}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            <Siren className="h-4 w-4 text-rose-500" />
            <span className="text-sm font-medium text-gray-800">
              {getReportTargetLabel(request)}
            </span>
          </div>
          <p className="truncate text-xs text-gray-500">
            대상: {request.target_name || request.target_code}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass(
            request.status
          )}`}
        >
          {statusLabel(request.status)}
        </span>
      </div>

      <p className="mt-2 whitespace-pre-wrap break-words rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
        {request.content}
      </p>
      <div className="mt-2 text-xs text-gray-500">
        요청일시: {formatDateTime(request.created_at)} | 처리일시: {formatDateTime(request.reviewed_at)}
      </div>
      {request.review_note ? (
        <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          거절 사유: {request.review_note}
        </p>
      ) : null}
    </div>
  );
}

export default function ProfileRequestsScreen({ embedded = false }: ProfileRequestsScreenProps) {
  const { user, isLoading: isAuthLoading } = useAuthStore();
  const { data, isLoading, isError, refetch } = useMyRequestHistory(user?.id);

  const [filter, setFilter] = useState<RequestFilter>("all");
  const [page, setPage] = useState(1);

  const containerClass = embedded ? "w-full" : "max-w-4xl mx-auto p-6 mt-4";

  const combinedRequests = useMemo<CombinedRequest[]>(() => {
    if (!data) return [];

    const registrationRequests: CombinedRequest[] = data.streamerRegistrationRequests.map(
      (request) => ({
        kind: "registration",
        id: request.id,
        created_at: request.created_at,
        reviewed_at: request.reviewed_at,
        status: request.status,
        review_note: request.review_note,
        platform: request.platform,
        platform_streamer_url: request.platform_streamer_url,
      })
    );

    const infoEditRequests: CombinedRequest[] = data.infoEditRequests.map((request) => ({
      kind: "info-edit",
      id: request.id,
      created_at: request.created_at,
      reviewed_at: request.reviewed_at,
      status: request.status,
      review_note: request.review_note,
      streamer_nickname: request.streamer_nickname,
      content: request.content,
    }));

    const reportRequests: CombinedRequest[] = data.entityReportRequests.map((request) => ({
      kind: "report",
      id: request.id,
      created_at: request.created_at,
      reviewed_at: request.reviewed_at,
      status: request.status,
      review_note: request.review_note,
      target_type: request.target_type,
      target_name: request.target_name,
      target_code: request.target_code,
      content: request.content,
    }));

    return [...registrationRequests, ...infoEditRequests, ...reportRequests].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [data]);

  const filteredRequests = useMemo(() => {
    if (filter === "registration") {
      return combinedRequests.filter((request) => request.kind === "registration");
    }
    if (filter === "info-edit") {
      return combinedRequests.filter((request) => request.kind === "info-edit");
    }
    if (filter === "report") {
      return combinedRequests.filter((request) => request.kind === "report");
    }
    return combinedRequests;
  }, [combinedRequests, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const pagedRequests = filteredRequests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = (nextFilter: RequestFilter) => {
    setPage(1);
    setFilter(nextFilter);
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
          <p className="mt-2 text-sm text-gray-500">
            요청 내역을 확인하려면 먼저 로그인해 주세요.
          </p>
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

  const registrationCount = data.streamerRegistrationRequests.length;
  const infoEditCount = data.infoEditRequests.length;
  const reportCount = data.entityReportRequests.length;
  const totalCount = registrationCount + infoEditCount + reportCount;

  return (
    <div className={containerClass}>
      <div className="mb-5 flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => handleFilterChange("all")}
          variant={filter === "all" ? "default" : "outline"}
          className={`cursor-pointer rounded-xl ${
            filter === "all" ? "bg-gray-900 hover:bg-gray-800 text-white" : ""
          }`}
        >
          전체 {totalCount}
        </Button>
        <Button
          type="button"
          onClick={() => handleFilterChange("registration")}
          variant={filter === "registration" ? "default" : "outline"}
          className={`cursor-pointer rounded-xl ${
            filter === "registration" ? "bg-gray-900 hover:bg-gray-800 text-white" : ""
          }`}
        >
          버츄얼 추가 요청 {registrationCount}
        </Button>
        <Button
          type="button"
          onClick={() => handleFilterChange("info-edit")}
          variant={filter === "info-edit" ? "default" : "outline"}
          className={`cursor-pointer rounded-xl ${
            filter === "info-edit" ? "bg-gray-900 hover:bg-gray-800 text-white" : ""
          }`}
        >
          정보 수정 요청 {infoEditCount}
        </Button>
        <Button
          type="button"
          onClick={() => handleFilterChange("report")}
          variant={filter === "report" ? "default" : "outline"}
          className={`cursor-pointer rounded-xl ${
            filter === "report" ? "bg-gray-900 hover:bg-gray-800 text-white" : ""
          }`}
        >
          신고 요청 {reportCount}
        </Button>
      </div>

      {pagedRequests.length ? (
        <div className="space-y-3">
          {pagedRequests.map((request) => (
            <RequestCard key={`${request.kind}-${request.id}`} request={request} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl bg-gray-50 px-4 py-6 text-sm text-gray-500">
          요청 내역이 없습니다.
        </p>
      )}

      <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
