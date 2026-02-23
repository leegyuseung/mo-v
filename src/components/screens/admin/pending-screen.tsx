"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePendingStreamerRequests } from "@/hooks/queries/admin/use-pending-streamer-requests";
import { useDeleteStreamerRequest } from "@/hooks/mutations/admin/use-delete-streamer-request";
import { useRegisterStreamerFromRequest } from "@/hooks/mutations/admin/use-register-streamer-from-request";
import { useChzzkChannelProfile } from "@/hooks/queries/admin/use-chzzk-channel-profile";
import type { RequestRowProps } from "@/types/admin";
import StreamerRequestTriggerButton from "@/components/common/streamer-request-trigger-button";

/**
 * 쉼표로 구분된 문자열을 배열로 파싱한다 (빈 항목 제거).
 * 예: "그룹1, 그룹2, " -> ["그룹1", "그룹2"]
 */
function parseTextArrayInput(input: string): string[] | null {
  // 1. 쉼표로 문자열 분리
  const parsed = input
    .split(",")
    // 2. 각 항목의 앞뒤 공백 제거
    .map((item) => item.trim())
    // 3. 빈 문자열 제거
    .filter(Boolean);

  // 4. 유효한 항목이 하나라도 있으면 배열 반환, 없으면 null 반환
  return parsed.length > 0 ? parsed : null;
}

/** 버츄얼 등록 대기 테이블의 개별 행 — 입력 폼과 등록/거절 액션 포함 */
function RequestRow({ request }: RequestRowProps) {
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

  const { mutate: deleteRequest, isPending: isRejecting } = useDeleteStreamerRequest();
  const { mutate: registerStreamer, isPending: isRegistering } =
    useRegisterStreamerFromRequest();

  const isChzzk = request.platform === "chzzk";
  const {
    data: chzzkProfile,
    isLoading: isChzzkLoading,
    isError: isChzzkError,
  } = useChzzkChannelProfile(request.platform_streamer_id, isChzzk);

  /** 등록/거절 처리 중 여부 */
  const isPendingAction = isRejecting || isRegistering;
  /** 닉네임: 사용자 입력 우선, 치지직일 경우 채널명 자동 조회 */
  const effectiveNickname =
    nickname.trim() || (isChzzk ? chzzkProfile?.channelName || "" : "");
  /** 이미지 URL: 사용자 입력 우선, 치지직일 경우 채널 이미지 자동 조회 */
  const effectiveImageUrl =
    imageUrl.trim() || (isChzzk ? chzzkProfile?.channelImageUrl || "" : "");

  /** 등록 버튼 클릭 핸들러 — 필수값 검증 후 mutation 실행 */
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
    <tr className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors align-top">
      <td className="px-4 py-3 text-sm">
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${request.platform === "chzzk"
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
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            onClick={handleRegister}
            disabled={isPendingAction}
            className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <CheckCircle2 className="w-4 h-4 mr-1" />
            등록
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => deleteRequest(request.id)}
            disabled={isPendingAction}
            className="cursor-pointer border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            <XCircle className="w-4 h-4 mr-1" />
            거절
          </Button>
        </div>
      </td>
    </tr>
  );
}

/** 관리자 버츄얼 등록 대기 화면 — 요청 목록 조회 및 등록/거절 처리 */
export default function PendingScreen() {
  const queryClient = useQueryClient();
  const { data: requests, isLoading } = usePendingStreamerRequests();

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-amber-500" />
            <h1 className="text-2xl font-bold text-gray-900">버츄얼 등록 대기</h1>
          </div>
          <p className="text-sm text-gray-500">유저가 요청한 버츄얼 등록 대기 목록입니다.</p>
        </div>
        <StreamerRequestTriggerButton
          className="h-9 cursor-pointer whitespace-nowrap border-gray-200 text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          onSubmitted={() =>
            queryClient.invalidateQueries({
              queryKey: ["admin", "pending-streamer-requests"],
            })
          }
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="min-w-[3400px] text-left">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">플랫폼</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">요청 주소</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">닉네임</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">이미지 주소</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">치지직 ID</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">SOOP ID</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">그룹명(text[])</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">소속명(text[])</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">생일</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">국적</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">성별</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">장르</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">첫 방송일</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">팬덤명</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">MBTI</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">별명</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">플랫폼 주소</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">팬카페 주소</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">유튜브 주소</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">요청일시</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-52">처리</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="px-4 py-3" colSpan={21}>
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))
            ) : requests && requests.length > 0 ? (
              requests.map((request) => <RequestRow key={request.id} request={request} />)
            ) : (
              <tr>
                <td colSpan={21} className="px-4 py-14 text-center text-gray-400 text-sm">
                  등록 대기 요청이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
