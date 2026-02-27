"use client";

import { useState } from "react";
import { UserRoundPen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import ConfirmAlert from "@/components/common/confirm-alert";
import AdminRequestActionButtons from "@/components/common/admin-request-action-buttons";
import { useStreamerInfoEditRequests } from "@/hooks/queries/admin/use-streamer-info-edit-requests";
import { useEntityInfoEditRequests } from "@/hooks/queries/admin/use-entity-info-edit-requests";
import { useResolveStreamerInfoEditRequest } from "@/hooks/mutations/admin/use-delete-streamer-info-edit-request";
import { useResolveEntityInfoEditRequest } from "@/hooks/mutations/admin/use-resolve-entity-info-edit-request";
import type { EntityInfoEditRequest, StreamerInfoEditRequest } from "@/types/admin-requests";
import { ADMIN_REVIEW_REWARD_POINT } from "@/lib/constant";

function ResolveConfirmAlert({
  open,
  confirmAction,
  reviewNote,
  isPending,
  onReviewNoteChange,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  confirmAction: "approve" | "reject" | null;
  reviewNote: string;
  isPending: boolean;
  onReviewNoteChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <ConfirmAlert
      open={open}
      title={confirmAction === "approve" ? "요청 확인" : "요청 거절"}
      description={
        confirmAction === "approve"
          ? `확인하시겠습니까? 요청자에게 ${ADMIN_REVIEW_REWARD_POINT}하트가 지급되고 요청 상태가 저장됩니다.`
          : "거절하시겠습니까? 하트 지급 없이 요청 상태가 저장됩니다."
      }
      confirmText={confirmAction === "approve" ? "확인" : "거절"}
      cancelText="취소"
      isPending={isPending}
      confirmDisabled={confirmAction === "reject" && !reviewNote.trim()}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      {confirmAction === "reject" ? (
        <Textarea
          value={reviewNote}
          onChange={(event) => onReviewNoteChange(event.target.value)}
          placeholder="거절 사유를 입력해 주세요."
          className="min-h-[88px]"
        />
      ) : null}
    </ConfirmAlert>
  );
}

function StreamerInfoEditRequestRow({ request }: { request: StreamerInfoEditRequest }) {
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const { mutate: resolveRequest, isPending } = useResolveStreamerInfoEditRequest();

  const handleConfirm = () => {
    if (!confirmAction) return;

    resolveRequest(
      {
        requestId: request.id,
        action: confirmAction,
        reviewNote: confirmAction === "reject" ? reviewNote.trim() : undefined,
      },
      {
        onSuccess: () => {
          setConfirmAction(null);
          setReviewNote("");
        },
      },
    );
  };

  return (
    <>
      <tr className="border-b border-gray-100 transition-colors hover:bg-gray-50/60">
        <td className="w-[170px] whitespace-nowrap px-4 py-3 text-sm text-gray-500">
          {new Date(request.created_at).toLocaleString("ko-KR")}
        </td>
        <td className="px-4 py-3 text-sm font-medium text-gray-800">
          {request.streamer_nickname}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {request.requester_nickname || request.requester_id}
        </td>
        <td className="w-[46%] px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap break-words">
          {request.content}
        </td>
        <td className="px-4 py-3 text-sm">
          <AdminRequestActionButtons
            onApprove={() => setConfirmAction("approve")}
            onReject={() => setConfirmAction("reject")}
            disabled={isPending}
          />
        </td>
      </tr>

      <ResolveConfirmAlert
        open={Boolean(confirmAction)}
        confirmAction={confirmAction}
        reviewNote={reviewNote}
        isPending={isPending}
        onReviewNoteChange={setReviewNote}
        onConfirm={handleConfirm}
        onCancel={() => {
          setConfirmAction(null);
          setReviewNote("");
        }}
      />
    </>
  );
}

function EntityInfoEditRequestRow({ request }: { request: EntityInfoEditRequest }) {
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const { mutate: resolveRequest, isPending } = useResolveEntityInfoEditRequest();

  const handleConfirm = () => {
    if (!confirmAction) return;

    resolveRequest(
      {
        requestId: request.id,
        action: confirmAction,
        reviewNote: confirmAction === "reject" ? reviewNote.trim() : undefined,
      },
      {
        onSuccess: () => {
          setConfirmAction(null);
          setReviewNote("");
        },
      },
    );
  };

  return (
    <>
      <tr className="border-b border-gray-100 transition-colors hover:bg-gray-50/60">
        <td className="w-[170px] whitespace-nowrap px-4 py-3 text-sm text-gray-500">
          {new Date(request.created_at).toLocaleString("ko-KR")}
        </td>
        <td className="px-4 py-3 text-sm text-gray-700">
          {request.target_type === "group"
            ? "그룹"
            : request.target_type === "crew"
              ? "크루"
              : "콘텐츠"}
        </td>
        <td className="px-4 py-3 text-sm font-medium text-gray-800">
          {request.target_name}
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {request.requester_nickname || request.requester_id}
        </td>
        <td className="w-[44%] px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap break-words">
          {request.content}
        </td>
        <td className="px-4 py-3 text-sm">
          <AdminRequestActionButtons
            onApprove={() => setConfirmAction("approve")}
            onReject={() => setConfirmAction("reject")}
            disabled={isPending}
          />
        </td>
      </tr>

      <ResolveConfirmAlert
        open={Boolean(confirmAction)}
        confirmAction={confirmAction}
        reviewNote={reviewNote}
        isPending={isPending}
        onReviewNoteChange={setReviewNote}
        onConfirm={handleConfirm}
        onCancel={() => {
          setConfirmAction(null);
          setReviewNote("");
        }}
      />
    </>
  );
}

/** 관리자 정보 수정 요청 화면 — 버츄얼과 그룹/크루 요청을 분리해 처리 */
export default function InfoEditRequestsScreen() {
  const { data: streamerRequests, isLoading: isStreamerRequestsLoading } = useStreamerInfoEditRequests();
  const { data: entityRequests, isLoading: isEntityRequestsLoading } = useEntityInfoEditRequests();

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-10">
      <div className="mb-8">
        <div className="mb-1 flex items-center gap-2">
          <UserRoundPen className="h-5 w-5 text-indigo-500" />
          <h1 className="text-2xl font-bold text-gray-900">정보 수정 요청</h1>
        </div>
        <p className="text-sm text-gray-500">유저가 보낸 정보 수정 요청 목록입니다.</p>
      </div>

      <section className="mb-8 space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">버츄얼 정보수정요청</h2>
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="min-w-[980px] w-full table-fixed text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="w-[170px] px-4 py-3 text-xs font-semibold uppercase text-gray-500">요청일시</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">버츄얼</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">요청자</th>
                <th className="w-[46%] px-4 py-3 text-xs font-semibold uppercase text-gray-500">수정 요청 내용</th>
                <th className="w-28 px-4 py-3 text-xs font-semibold uppercase text-gray-500">처리</th>
              </tr>
            </thead>
            <tbody>
              {isStreamerRequestsLoading ? (
                [...Array(4)].map((_, index) => (
                  <tr key={`streamer-info-edit-skeleton-${index}`} className="border-b border-gray-100">
                    <td className="px-4 py-3" colSpan={5}>
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))
              ) : streamerRequests && streamerRequests.length > 0 ? (
                streamerRequests.map((request) => (
                  <StreamerInfoEditRequestRow key={request.id} request={request} />
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-14 text-center text-sm text-gray-400">
                    버츄얼 정보 수정 요청이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-gray-900">그룹/크루/콘텐츠 정보수정요청</h2>
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="min-w-[1080px] w-full table-fixed text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/80">
                <th className="w-[170px] px-4 py-3 text-xs font-semibold uppercase text-gray-500">요청일시</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">구분</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">대상</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">요청자</th>
                <th className="w-[44%] px-4 py-3 text-xs font-semibold uppercase text-gray-500">수정 요청 내용</th>
                <th className="w-28 px-4 py-3 text-xs font-semibold uppercase text-gray-500">처리</th>
              </tr>
            </thead>
            <tbody>
              {isEntityRequestsLoading ? (
                [...Array(4)].map((_, index) => (
                  <tr key={`entity-info-edit-skeleton-${index}`} className="border-b border-gray-100">
                    <td className="px-4 py-3" colSpan={6}>
                      <Skeleton className="h-5 w-full" />
                    </td>
                  </tr>
                ))
              ) : entityRequests && entityRequests.length > 0 ? (
                entityRequests.map((request) => (
                  <EntityInfoEditRequestRow key={request.id} request={request} />
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center text-sm text-gray-400">
                    그룹/크루/콘텐츠 정보 수정 요청이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
