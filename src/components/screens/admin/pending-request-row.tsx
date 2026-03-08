"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import ConfirmAlert from "@/components/common/confirm-alert";
import AdminRequestActionButtons from "@/components/common/admin-request-action-buttons";
import PendingRequestInputCell from "@/components/screens/admin/pending-request-input-cell";
import { useUpdateStreamerRequestStatus } from "@/hooks/mutations/admin/use-update-streamer-request-status";
import { useRegisterStreamerFromRequest } from "@/hooks/mutations/admin/use-register-streamer-from-request";
import { usePendingStreamerRequestForm } from "@/hooks/admin/use-pending-streamer-request-form";
import { parseCommaSeparatedTextInput } from "@/utils/admin-request";
import type { RequestRowProps } from "@/types/admin-component-props";

const INPUT_CLASS_NAMES = {
  short: "h-8 min-w-24",
  medium: "h-8 min-w-28",
  wide: "h-8 min-w-36",
  xwide: "h-8 min-w-44",
  url: "h-8 min-w-52",
} as const;

/** 버츄얼 등록 대기 테이블의 개별 행 — 입력 폼과 등록/거절 액션 포함 */
export default function PendingRequestRow({ request }: RequestRowProps) {
  const [isRejectAlertOpen, setIsRejectAlertOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const { mutate: updateRequestStatus, isPending: isUpdatingStatus } =
    useUpdateStreamerRequestStatus();
  const { mutate: registerStreamer, isPending: isRegistering } =
    useRegisterStreamerFromRequest();
  const {
    form,
    setField,
    effectiveNickname,
    effectiveImageUrl,
    isChzzkRequest,
    isChzzkLoading,
    isChzzkError,
  } = usePendingStreamerRequestForm({ request });

  const isPendingAction = isUpdatingStatus || isRegistering;

  const handleRegister = () => {
    if (!effectiveNickname) {
      toast.error("닉네임을 입력해 주세요.");
      return;
    }

    if (!effectiveImageUrl) {
      toast.error("이미지 주소를 입력해 주세요.");
      return;
    }

    registerStreamer({
      requestId: request.id,
      nickname: effectiveNickname,
      imageUrl: effectiveImageUrl,
      chzzkId: form.chzzkId.trim() || null,
      soopId: form.soopId.trim() || null,
      groupName: parseCommaSeparatedTextInput(form.groupNameInput),
      crewName: parseCommaSeparatedTextInput(form.crewNameInput),
      birthday: form.birthday.trim() || null,
      nationality: form.nationality.trim() || null,
      gender: form.gender.trim() || null,
      genre: parseCommaSeparatedTextInput(form.genreInput),
      firstStreamDate: form.firstStreamDate.trim() || null,
      fandomName: form.fandomName.trim() || null,
      mbti: form.mbti.trim() || null,
      alias: parseCommaSeparatedTextInput(form.aliasInput),
      platformUrl: form.platformUrl.trim() || null,
      fancafeUrl: form.fancafeUrl.trim() || null,
      youtubeUrl: form.youtubeUrl.trim() || null,
      supporters: form.supporters.trim() || null,
    });
  };

  return (
    <>
      <tr className="align-top transition-colors hover:bg-gray-50/60 border-b border-gray-100">
        <td className="px-4 py-3 text-sm">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              request.platform === "chzzk"
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {request.platform.toUpperCase()}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">
          {request.platform_streamer_url ? (
            <a
              href={request.platform_streamer_url}
              target="_blank"
              rel="noreferrer"
              className="inline-block max-w-[220px] truncate text-blue-500 underline underline-offset-2 hover:text-blue-600"
              title={request.platform_streamer_url}
            >
              {request.platform_streamer_url}
            </a>
          ) : (
            "-"
          )}
        </td>
        <PendingRequestInputCell
          value={effectiveNickname}
          onChange={(value) => setField("nickname", value)}
          placeholder={isChzzkRequest ? "치지직 닉네임 자동 조회" : "닉네임 입력"}
          inputClassName={INPUT_CLASS_NAMES.wide}
        />
        <PendingRequestInputCell
          value={effectiveImageUrl}
          onChange={(value) => setField("imageUrl", value)}
          placeholder={isChzzkRequest ? "치지직 이미지 자동 조회" : "이미지 주소 입력"}
          inputClassName={INPUT_CLASS_NAMES.url}
          hint={
            isChzzkRequest && isChzzkLoading ? (
              <p className="mt-1 text-[11px] text-gray-400">
                치지직 채널 정보를 불러오는 중입니다.
              </p>
            ) : isChzzkRequest && isChzzkError ? (
              <p className="mt-1 text-[11px] text-red-500">
                치지직 채널 정보를 불러오지 못했습니다.
              </p>
            ) : null
          }
        />
        <PendingRequestInputCell
          value={form.chzzkId}
          onChange={(value) => setField("chzzkId", value)}
          placeholder="chzzk ID"
          inputClassName={INPUT_CLASS_NAMES.wide}
        />
        <PendingRequestInputCell
          value={form.soopId}
          onChange={(value) => setField("soopId", value)}
          placeholder="soop ID"
          inputClassName={INPUT_CLASS_NAMES.medium}
        />
        <PendingRequestInputCell
          value={form.groupNameInput}
          onChange={(value) => setField("groupNameInput", value)}
          placeholder="그룹명 (쉼표로 구분)"
          inputClassName={INPUT_CLASS_NAMES.xwide}
        />
        <PendingRequestInputCell
          value={form.crewNameInput}
          onChange={(value) => setField("crewNameInput", value)}
          placeholder="소속명 (쉼표로 구분)"
          inputClassName={INPUT_CLASS_NAMES.xwide}
        />
        <PendingRequestInputCell
          value={form.supporters}
          onChange={(value) => setField("supporters", value)}
          placeholder="서포터즈"
          inputClassName={INPUT_CLASS_NAMES.xwide}
        />
        <PendingRequestInputCell
          value={form.birthday}
          onChange={(value) => setField("birthday", value)}
          placeholder="생일 (예: 1월 15일)"
          inputClassName={INPUT_CLASS_NAMES.xwide}
        />
        <PendingRequestInputCell
          value={form.nationality}
          onChange={(value) => setField("nationality", value)}
          placeholder="국적"
          inputClassName={INPUT_CLASS_NAMES.medium}
        />
        <PendingRequestInputCell
          value={form.gender}
          onChange={(value) => setField("gender", value)}
          placeholder="성별"
          inputClassName={INPUT_CLASS_NAMES.short}
        />
        <PendingRequestInputCell
          value={form.genreInput}
          onChange={(value) => setField("genreInput", value)}
          placeholder="장르 (쉼표로 구분)"
          inputClassName={INPUT_CLASS_NAMES.xwide}
        />
        <PendingRequestInputCell
          value={form.firstStreamDate}
          onChange={(value) => setField("firstStreamDate", value)}
          placeholder="첫 방송일 (예: 2023년 5월)"
          inputClassName={INPUT_CLASS_NAMES.xwide}
        />
        <PendingRequestInputCell
          value={form.fandomName}
          onChange={(value) => setField("fandomName", value)}
          placeholder="팬덤명"
          inputClassName={INPUT_CLASS_NAMES.medium}
        />
        <PendingRequestInputCell
          value={form.mbti}
          onChange={(value) => setField("mbti", value)}
          placeholder="MBTI"
          inputClassName={INPUT_CLASS_NAMES.short}
        />
        <PendingRequestInputCell
          value={form.aliasInput}
          onChange={(value) => setField("aliasInput", value)}
          placeholder="별명 (쉼표로 구분)"
          inputClassName={INPUT_CLASS_NAMES.xwide}
        />
        <PendingRequestInputCell
          value={form.platformUrl}
          onChange={(value) => setField("platformUrl", value)}
          placeholder="플랫폼 주소"
          inputClassName={INPUT_CLASS_NAMES.url}
        />
        <PendingRequestInputCell
          value={form.fancafeUrl}
          onChange={(value) => setField("fancafeUrl", value)}
          placeholder="팬카페 주소"
          inputClassName={INPUT_CLASS_NAMES.url}
        />
        <PendingRequestInputCell
          value={form.youtubeUrl}
          onChange={(value) => setField("youtubeUrl", value)}
          placeholder="유튜브 주소"
          inputClassName={INPUT_CLASS_NAMES.url}
        />
        <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">
          {new Date(request.created_at).toLocaleString("ko-KR")}
        </td>
        <td className="px-4 py-3">
          <AdminRequestActionButtons
            approveLabel="등록"
            rejectLabel="거절"
            onApprove={handleRegister}
            onReject={() => setIsRejectAlertOpen(true)}
            disabled={isPendingAction}
          />
        </td>
      </tr>

      <ConfirmAlert
        open={isRejectAlertOpen}
        title="등록 요청 거절"
        description="거절 사유를 입력해 주세요. 사유와 처리자 ID가 함께 저장됩니다."
        confirmText="거절"
        cancelText="취소"
        isPending={isPendingAction}
        confirmDisabled={!rejectReason.trim()}
        onConfirm={() =>
          updateRequestStatus(
            {
              requestId: request.id,
              status: "rejected",
              reviewNote: rejectReason.trim(),
            },
            {
              onSuccess: () => {
                setIsRejectAlertOpen(false);
                setRejectReason("");
              },
            }
          )
        }
        onCancel={() => {
          setIsRejectAlertOpen(false);
          setRejectReason("");
        }}
      >
        <Textarea
          value={rejectReason}
          onChange={(event) => setRejectReason(event.target.value)}
          placeholder="거절 사유를 입력해 주세요."
          className="min-h-[88px]"
        />
      </ConfirmAlert>
    </>
  );
}
