"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ConfirmAlert from "@/components/common/confirm-alert";
import AdminRequestActionButtons from "@/components/common/admin-request-action-buttons";
import { useUpdateStreamerRequestStatus } from "@/hooks/mutations/admin/use-update-streamer-request-status";
import { useRegisterStreamerFromRequest } from "@/hooks/mutations/admin/use-register-streamer-from-request";
import { useChzzkChannelProfile } from "@/hooks/queries/admin/use-chzzk-channel-profile";
import type { RequestRowProps } from "@/types/admin-component-props";

/** 쉼표 입력을 배열로 변환한다. */
function parseTextArrayInput(input: string): string[] | null {
  const parsed = input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return parsed.length > 0 ? parsed : null;
}

/** 버츄얼 등록 대기 테이블의 개별 행 — 입력 폼과 등록/거절 액션 포함 */
export default function PendingRequestRow({ request }: RequestRowProps) {
  const [nickname, setNickname] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [chzzkId, setChzzkId] = useState(
    request.platform === "chzzk" ? request.platform_streamer_id : ""
  );
  const [soopId, setSoopId] = useState(
    request.platform === "soop" ? request.platform_streamer_id : ""
  );
  const [groupNameInput, setGroupNameInput] = useState("");
  const [crewNameInput, setCrewNameInput] = useState("");
  const [birthday, setBirthday] = useState("");
  const [nationality, setNationality] = useState("");
  const [gender, setGender] = useState("");
  const [genreInput, setGenreInput] = useState("");
  const [firstStreamDate, setFirstStreamDate] = useState("");
  const [fandomName, setFandomName] = useState("");
  const [mbti, setMbti] = useState("");
  const [aliasInput, setAliasInput] = useState("");
  const [platformUrl, setPlatformUrl] = useState(request.platform_streamer_url || "");
  const [fancafeUrl, setFancafeUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [isRejectAlertOpen, setIsRejectAlertOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const { mutate: updateRequestStatus, isPending: isUpdatingStatus } =
    useUpdateStreamerRequestStatus();
  const { mutate: registerStreamer, isPending: isRegistering } =
    useRegisterStreamerFromRequest();

  const isChzzk = request.platform === "chzzk";
  const {
    data: chzzkProfile,
    isLoading: isChzzkLoading,
    isError: isChzzkError,
  } = useChzzkChannelProfile(request.platform_streamer_id, isChzzk);

  const isPendingAction = isUpdatingStatus || isRegistering;
  const effectiveNickname =
    nickname.trim() || (isChzzk ? chzzkProfile?.channelName || "" : "");
  const effectiveImageUrl =
    imageUrl.trim() || (isChzzk ? chzzkProfile?.channelImageUrl || "" : "");

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
      chzzkId: chzzkId.trim() || null,
      soopId: soopId.trim() || null,
      groupName: parseTextArrayInput(groupNameInput),
      crewName: parseTextArrayInput(crewNameInput),
      birthday: birthday.trim() || null,
      nationality: nationality.trim() || null,
      gender: gender.trim() || null,
      genre: parseTextArrayInput(genreInput),
      firstStreamDate: firstStreamDate.trim() || null,
      fandomName: fandomName.trim() || null,
      mbti: mbti.trim() || null,
      alias: parseTextArrayInput(aliasInput),
      platformUrl: platformUrl.trim() || null,
      fancafeUrl: fancafeUrl.trim() || null,
      youtubeUrl: youtubeUrl.trim() || null,
    });
  };

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors align-top">
        <td className="px-4 py-3 text-sm">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
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
              className="inline-block max-w-[220px] truncate text-blue-500 hover:text-blue-600 underline underline-offset-2"
              title={request.platform_streamer_url}
            >
              {request.platform_streamer_url}
            </a>
          ) : (
            "-"
          )}
        </td>
        <td className="px-4 py-3 text-sm">
          <Input
            value={effectiveNickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder={isChzzk ? "치지직 닉네임 자동 조회" : "닉네임 입력"}
            className="h-8 min-w-36"
          />
        </td>
        <td className="px-4 py-3 text-sm">
          <Input
            value={effectiveImageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder={isChzzk ? "치지직 이미지 자동 조회" : "이미지 주소 입력"}
            className="h-8 min-w-52"
          />
          {isChzzk && isChzzkLoading ? (
            <p className="mt-1 text-[11px] text-gray-400">치지직 채널 정보를 불러오는 중입니다.</p>
          ) : null}
          {isChzzk && isChzzkError ? (
            <p className="mt-1 text-[11px] text-red-500">치지직 채널 정보를 불러오지 못했습니다.</p>
          ) : null}
        </td>
        <td className="px-4 py-3 text-sm">
          <Input
            value={chzzkId}
            onChange={(e) => setChzzkId(e.target.value)}
            placeholder="chzzk ID"
            className="h-8 min-w-36"
          />
        </td>
        <td className="px-4 py-3 text-sm">
          <Input
            value={soopId}
            onChange={(e) => setSoopId(e.target.value)}
            placeholder="soop ID"
            className="h-8 min-w-28"
          />
        </td>
        <td className="px-4 py-3 text-sm">
          <Input
            value={groupNameInput}
            onChange={(e) => setGroupNameInput(e.target.value)}
            placeholder="그룹명 (쉼표로 구분)"
            className="h-8 min-w-44"
          />
        </td>
        <td className="px-4 py-3 text-sm">
          <Input
            value={crewNameInput}
            onChange={(e) => setCrewNameInput(e.target.value)}
            placeholder="소속명 (쉼표로 구분)"
            className="h-8 min-w-44"
          />
        </td>
        <td className="px-4 py-3 text-sm">
          <Input
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            placeholder="생일 (예: 1월 15일)"
            className="h-8 min-w-44"
          />
        </td>
        <td className="px-4 py-3 text-sm">
          <Input
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            placeholder="국적"
            className="h-8 min-w-28"
          />
        </td>
        <td className="px-4 py-3 text-sm">
          <Input
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            placeholder="성별"
            className="h-8 min-w-24"
          />
        </td>
        <td className="px-4 py-3 text-sm">
          <Input
            value={genreInput}
            onChange={(e) => setGenreInput(e.target.value)}
            placeholder="장르 (쉼표로 구분)"
            className="h-8 min-w-44"
          />
        </td>
        <td className="px-4 py-3 text-sm">
          <Input
            value={firstStreamDate}
            onChange={(e) => setFirstStreamDate(e.target.value)}
            placeholder="첫 방송일 (예: 2023년 5월)"
            className="h-8 min-w-44"
          />
        </td>
        <td className="px-4 py-3 text-sm">
          <Input
            value={fandomName}
            onChange={(e) => setFandomName(e.target.value)}
            placeholder="팬덤명"
            className="h-8 min-w-28"
          />
        </td>
        <td className="px-4 py-3 text-sm">
          <Input
            value={mbti}
            onChange={(e) => setMbti(e.target.value)}
            placeholder="MBTI"
            className="h-8 min-w-24"
          />
        </td>
        <td className="px-4 py-3 text-sm">
          <Input
            value={aliasInput}
            onChange={(e) => setAliasInput(e.target.value)}
            placeholder="별명 (쉼표로 구분)"
            className="h-8 min-w-44"
          />
        </td>
        <td className="px-4 py-3 text-sm">
          <Input
            value={platformUrl}
            onChange={(e) => setPlatformUrl(e.target.value)}
            placeholder="플랫폼 주소"
            className="h-8 min-w-52"
          />
        </td>
        <td className="px-4 py-3 text-sm">
          <Input
            value={fancafeUrl}
            onChange={(e) => setFancafeUrl(e.target.value)}
            placeholder="팬카페 주소"
            className="h-8 min-w-52"
          />
        </td>
        <td className="px-4 py-3 text-sm">
          <Input
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="유튜브 주소"
            className="h-8 min-w-52"
          />
        </td>
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
