import { Boxes, Bug, CirclePlus, FilePenLine, Siren } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CombinedRequest } from "@/types/profile";
import {
  formatProfileRequestDateTime,
  getInfoEditTargetLabel,
  getProfileRequestStatusClass,
  getProfileRequestStatusLabel,
  getReportTargetLabel,
} from "@/utils/profile-request";

type ProfileRequestCardProps = {
  request: CombinedRequest;
  onCancelRequest?: (request: CombinedRequest) => Promise<void> | void;
  isCancelling?: boolean;
};

function getRegistrationRequestLinkLabel(rawUrl: string) {
  const trimmed = rawUrl.trim();
  if (!trimmed) return "-";

  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const url = new URL(candidate);
    const segments = url.pathname.split("/").filter(Boolean);
    const stationIndex = segments.findIndex((segment) => segment.toLowerCase() === "station");

    if (stationIndex >= 0 && segments[stationIndex + 1]) {
      return segments[stationIndex + 1];
    }

    return segments[segments.length - 1] || trimmed;
  } catch {
    return trimmed;
  }
}

/** 요청 유형별 카드 렌더링 */
export default function ProfileRequestCard({
  request,
  onCancelRequest,
  isCancelling = false,
}: ProfileRequestCardProps) {
  const canCancel =
    request.status === "pending" &&
    request.kind !== "error-report" &&
    Boolean(onCancelRequest);
  const handleCancel = () => {
    onCancelRequest?.(request);
  };

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
                  request.platform === "chzzk" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                }`}
              >
                {request.platform.toUpperCase()}
              </span>
            </div>
            <p
              className="block max-w-[620px] truncate text-sm text-gray-600"
              title={request.platform_streamer_url}
            >
              {getRegistrationRequestLinkLabel(request.platform_streamer_url)}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${getProfileRequestStatusClass(request.status)}`}
          >
            {getProfileRequestStatusLabel(request.status)}
          </span>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          요청일시: {formatProfileRequestDateTime(request.created_at)} | 처리일시:{" "}
          {formatProfileRequestDateTime(request.reviewed_at)}
        </div>
        {canCancel ? (
          <div className="mt-2 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isCancelling}
              className="cursor-pointer"
            >
              {isCancelling ? "취소 중..." : "취소"}
            </Button>
          </div>
        ) : null}

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
                {getInfoEditTargetLabel(request.target_type)}
              </span>
            </div>
            <p className="truncate text-xs text-gray-500">
              대상: {request.target_name || request.target_code || "-"}
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${getProfileRequestStatusClass(request.status)}`}
          >
            {getProfileRequestStatusLabel(request.status)}
          </span>
        </div>

        <p className="mt-2 whitespace-pre-wrap break-words rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
          {request.content}
        </p>
        <div className="mt-2 text-xs text-gray-500">
          요청일시: {formatProfileRequestDateTime(request.created_at)} | 처리일시:{" "}
          {formatProfileRequestDateTime(request.reviewed_at)}
        </div>
        {canCancel ? (
          <div className="mt-2 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isCancelling}
              className="cursor-pointer"
            >
              {isCancelling ? "취소 중..." : "취소"}
            </Button>
          </div>
        ) : null}
        {request.review_note ? (
          <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            거절 사유: {request.review_note}
          </p>
        ) : null}
      </div>
    );
  }

  if (request.kind === "live-box") {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <Boxes className="h-4 w-4 text-cyan-600" />
              <span className="text-sm font-medium text-gray-800">라이브박스 요청</span>
            </div>
            <p className="truncate text-sm font-medium text-gray-800">{request.topic}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${getProfileRequestStatusClass(request.status)}`}
          >
            {getProfileRequestStatusLabel(request.status)}
          </span>
        </div>

        <div className="mt-2 text-xs text-gray-500">
          요청일시: {formatProfileRequestDateTime(request.created_at)} | 처리일시:{" "}
          {formatProfileRequestDateTime(request.reviewed_at)}
        </div>
        {canCancel ? (
          <div className="mt-2 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isCancelling}
              className="cursor-pointer"
            >
              {isCancelling ? "취소 중..." : "취소"}
            </Button>
          </div>
        ) : null}
        {request.review_note ? (
          <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
            거절 사유: {request.review_note}
          </p>
        ) : null}
      </div>
    );
  }

  if (request.kind === "error-report") {
    return (
      <div className="rounded-xl border border-gray-100 bg-white p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-1 flex items-center gap-2">
              <Bug className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium text-gray-800">오류 신고 요청</span>
            </div>
            <p className="truncate text-sm font-medium text-gray-800">{request.title}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${getProfileRequestStatusClass(request.status)}`}
          >
            {getProfileRequestStatusLabel(request.status)}
          </span>
        </div>

        <p className="mt-2 whitespace-pre-wrap break-words rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
          {request.detail}
        </p>
        <div className="mt-2 text-xs text-gray-500">
          요청일시: {formatProfileRequestDateTime(request.created_at)} | 처리일시:{" "}
          {formatProfileRequestDateTime(request.reviewed_at)}
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
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${getProfileRequestStatusClass(request.status)}`}
        >
          {getProfileRequestStatusLabel(request.status)}
        </span>
      </div>

      <p className="mt-2 whitespace-pre-wrap break-words rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
        {request.content}
      </p>
      <div className="mt-2 text-xs text-gray-500">
        요청일시: {formatProfileRequestDateTime(request.created_at)} | 처리일시:{" "}
        {formatProfileRequestDateTime(request.reviewed_at)}
      </div>
      {canCancel ? (
        <div className="mt-2 flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancel}
            disabled={isCancelling}
            className="cursor-pointer"
          >
            {isCancelling ? "취소 중..." : "취소"}
          </Button>
        </div>
      ) : null}
      {request.review_note ? (
        <p className="mt-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">
          거절 사유: {request.review_note}
        </p>
      ) : null}
    </div>
  );
}
