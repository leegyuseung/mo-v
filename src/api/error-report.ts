import type {
  CreateErrorReportPayload,
  CreateErrorReportResponse,
} from "@/types/error-report";

export async function createErrorReport(
  payload: CreateErrorReportPayload
): Promise<CreateErrorReportResponse> {
  const response = await fetch("/api/error-reports", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
    body: JSON.stringify(payload),
  });

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(body?.message || "오류 신고 접수에 실패했습니다.");
  }

  return body as CreateErrorReportResponse;
}

