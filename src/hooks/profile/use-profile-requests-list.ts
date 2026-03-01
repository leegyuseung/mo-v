import { useMemo, useState } from "react";
import type {
  CombinedRequest,
  MyRequestHistory,
  RequestFilter,
} from "@/types/profile";
import { normalizeProfileRequestStatus } from "@/utils/profile-request";

type UseProfileRequestsListResult = {
  filter: RequestFilter;
  page: number;
  setPage: (page: number) => void;
  handleFilterChange: (nextFilter: RequestFilter) => void;
  pagedRequests: CombinedRequest[];
  currentPage: number;
  totalPages: number;
  registrationCount: number;
  infoEditCount: number;
  reportCount: number;
  errorReportCount: number;
  liveBoxCount: number;
  totalCount: number;
};

/** 요청 데이터 병합 + 필터 + 페이지네이션을 담당한다. */
export function useProfileRequestsList(
  data: MyRequestHistory | undefined,
  itemsPerPage: number
): UseProfileRequestsListResult {
  const [filter, setFilter] = useState<RequestFilter>("all");
  const [page, setPage] = useState(1);

  const combinedRequests = useMemo<CombinedRequest[]>(() => {
    if (!data) return [];

    const registrationRequests: CombinedRequest[] = data.streamerRegistrationRequests.map(
      (request) => ({
        kind: "registration",
        id: request.id,
        created_at: request.created_at,
        reviewed_at: request.reviewed_at,
        status: normalizeProfileRequestStatus(request.status),
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
      status: normalizeProfileRequestStatus(request.status),
      review_note: request.review_note,
      source: request.source,
      target_type: request.target_type,
      target_name: request.target_name,
      target_code: request.target_code,
      content: request.content,
    }));

    const reportRequests: CombinedRequest[] = data.entityReportRequests.map((request) => ({
      kind: "report",
      id: request.id,
      created_at: request.created_at,
      reviewed_at: request.reviewed_at,
      status: normalizeProfileRequestStatus(request.status),
      review_note: request.review_note,
      target_type: request.target_type,
      target_name: request.target_name,
      target_code: request.target_code,
      content: request.content,
    }));

    const errorReportRequests: CombinedRequest[] = data.errorReportRequests.map((request) => ({
      kind: "error-report",
      id: request.id,
      created_at: request.reported_at,
      reviewed_at: request.reviewed_at,
      status: normalizeProfileRequestStatus(request.status),
      review_note: request.review_note,
      title: request.title,
      detail: request.detail,
    }));

    const liveBoxRequests: CombinedRequest[] = data.liveBoxRequests.map((request) => ({
      kind: "live-box",
      id: request.id,
      created_at: request.created_at,
      reviewed_at: request.reviewed_at,
      status: normalizeProfileRequestStatus(request.status),
      review_note: request.review_note,
      topic: request.topic,
      related_site: request.related_site,
    }));

    return [
      ...registrationRequests,
      ...infoEditRequests,
      ...reportRequests,
      ...errorReportRequests,
      ...liveBoxRequests,
    ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
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
    if (filter === "error-report") {
      return combinedRequests.filter((request) => request.kind === "error-report");
    }
    if (filter === "live-box") {
      return combinedRequests.filter((request) => request.kind === "live-box");
    }
    return combinedRequests;
  }, [combinedRequests, filter]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / itemsPerPage));
  const currentPage = Math.min(page, totalPages);
  const pagedRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = (nextFilter: RequestFilter) => {
    setPage(1);
    setFilter(nextFilter);
  };

  const registrationCount = data?.streamerRegistrationRequests.length || 0;
  const infoEditCount = data?.infoEditRequests.length || 0;
  const reportCount = data?.entityReportRequests.length || 0;
  const errorReportCount = data?.errorReportRequests.length || 0;
  const liveBoxCount = data?.liveBoxRequests.length || 0;
  const totalCount = registrationCount + infoEditCount + reportCount + errorReportCount + liveBoxCount;

  return {
    filter,
    page,
    setPage,
    handleFilterChange,
    pagedRequests,
    currentPage,
    totalPages,
    registrationCount,
    infoEditCount,
    reportCount,
    errorReportCount,
    liveBoxCount,
    totalCount,
  };
}
