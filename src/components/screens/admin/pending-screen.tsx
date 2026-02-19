"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePendingStreamerRequests } from "@/hooks/queries/admin/use-pending-streamer-requests";
import { useDeleteStreamerRequest } from "@/hooks/mutations/admin/use-delete-streamer-request";
import { useRegisterStreamerFromRequest } from "@/hooks/mutations/admin/use-register-streamer-from-request";
import { useChzzkChannelProfile } from "@/hooks/queries/admin/use-chzzk-channel-profile";
import type { StreamerRegistrationRequest } from "@/types/admin";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

function RequestRow({ request }: { request: StreamerRegistrationRequest }) {
    const [nickname, setNickname] = useState("");
    const [imageUrl, setImageUrl] = useState("");
    const [groupNameInput, setGroupNameInput] = useState("");
    const { mutate: deleteRequest, isPending: isRejecting } =
        useDeleteStreamerRequest();
    const { mutate: registerStreamer, isPending: isRegistering } =
        useRegisterStreamerFromRequest();
    const {
        data: chzzkProfile,
        isLoading: isChzzkLoading,
        isError: isChzzkError,
    } = useChzzkChannelProfile(
        request.platform_streamer_id,
        request.platform === "chzzk"
    );
    const isChzzk = request.platform === "chzzk";

    const isPendingAction = isRejecting || isRegistering;
    const effectiveNickname =
        nickname.trim() || (isChzzk ? chzzkProfile?.channelName || "" : "");
    const effectiveImageUrl =
        imageUrl.trim() ||
        (isChzzk ? chzzkProfile?.channelImageUrl || "" : "");

    const handleRegister = () => {
        if (!effectiveNickname) {
            toast.error("닉네임을 입력해 주세요.");
            return;
        }
        if (!effectiveImageUrl) {
            toast.error("이미지 주소를 입력해 주세요.");
            return;
        }
        const parsedGroupName = groupNameInput
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);

        registerStreamer({
            requestId: request.id,
            nickname: effectiveNickname,
            imageUrl: effectiveImageUrl,
            groupName: parsedGroupName.length > 0 ? parsedGroupName : null,
        });
    };

    return (
        <tr className="border-b border-gray-100 hover:bg-gray-50/60 transition-colors">
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
                        className="text-blue-500 hover:text-blue-600 underline underline-offset-2 break-all"
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
                    readOnly={isChzzk}
                />
            </td>
            <td className="px-4 py-3 text-sm">
                <Input
                    value={effectiveImageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder={isChzzk ? "치지직 이미지 주소 자동 조회" : "이미지 주소 입력"}
                    className="h-8 min-w-52"
                    readOnly={isChzzk}
                />
                {isChzzk && isChzzkLoading && (
                    <p className="mt-1 text-[11px] text-gray-400">치지직 채널 정보를 불러오는 중입니다.</p>
                )}
                {isChzzk && isChzzkError && (
                    <p className="mt-1 text-[11px] text-red-500">치지직 채널 정보를 불러오지 못했습니다.</p>
                )}
                {isChzzk &&
                    !isChzzkLoading &&
                    !isChzzkError &&
                    !effectiveNickname &&
                    !effectiveImageUrl && (
                        <p className="mt-1 text-[11px] text-amber-600">
                            치지직 응답에 채널 정보가 없습니다.
                        </p>
                    )}
            </td>
            <td className="px-4 py-3 text-sm">
                <Input
                    value={groupNameInput}
                    onChange={(e) => setGroupNameInput(e.target.value)}
                    placeholder="그룹명 입력 (쉼표로 구분)"
                    className="h-8 min-w-56"
                />
            </td>
            <td className="px-4 py-3 text-sm text-gray-400">
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

export default function PendingScreen() {
    const { data: requests, isLoading } = usePendingStreamerRequests();

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <h1 className="text-2xl font-bold text-gray-900">버츄얼 등록 대기</h1>
                </div>
                <p className="text-sm text-gray-500">
                    유저가 요청한 버츄얼 등록 대기 목록입니다.
                </p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                <table className="w-full text-left min-w-[1120px]">
                    <thead>
                        <tr className="bg-gray-50/80 border-b border-gray-100">
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                플랫폼
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                요청 주소
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                닉네임
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                이미지 주소
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                그룹명(text[])
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                                요청일시
                            </th>
                            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-52">
                                처리
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            [...Array(4)].map((_, i) => (
                                <tr key={i} className="border-b border-gray-100">
                                    <td className="px-4 py-3" colSpan={7}>
                                        <Skeleton className="h-5 w-full" />
                                    </td>
                                </tr>
                            ))
                        ) : requests && requests.length > 0 ? (
                            requests.map((request) => (
                                <RequestRow key={request.id} request={request} />
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={7}
                                    className="px-4 py-14 text-center text-gray-400 text-sm"
                                >
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
