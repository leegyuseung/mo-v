"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStreamerDetail } from "@/hooks/queries/streamers/use-streamer-detail";
import { useIdolGroupCodeNames } from "@/hooks/queries/groups/use-idol-group-code-names";
import { useCreateStreamerInfoEditRequest } from "@/hooks/mutations/streamers/use-create-streamer-info-edit-request";
import { Button } from "@/components/ui/button";
import { ArrowBigLeft, UserRoundPen } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { STREAMER_INFO_EDIT_REQUEST_MODAL_TEXT } from "@/lib/constant";

export default function VlistDetailScreen({
  streamerPublicId,
}: {
  streamerPublicId: string;
}) {
  const [isEditRequestModalOpen, setIsEditRequestModalOpen] = useState(false);
  const [editRequestContent, setEditRequestContent] = useState("");
  const { data: streamer, isLoading } = useStreamerDetail(streamerPublicId);
  const { user, profile } = useAuthStore();
  const {
    mutateAsync: createInfoEditRequest,
    isPending: isInfoEditRequestSubmitting,
  } = useCreateStreamerInfoEditRequest();
  const { data: idolGroups } = useIdolGroupCodeNames();

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (!streamer) {
    return <div className="p-6 text-center text-gray-400">스트리머 정보가 없습니다.</div>;
  }

  // platform 컬럼 값이 오래된 경우를 대비해 URL/ID 기반으로 플랫폼을 보정한다.
  const canonicalPlatform: "chzzk" | "soop" =
    streamer.platform_url?.includes("sooplive.co.kr") ||
      (!!streamer.soop_id && !streamer.chzzk_id)
      ? "soop"
      : streamer.platform_url?.includes("chzzk.naver.com") ||
        (!!streamer.chzzk_id && !streamer.soop_id)
        ? "chzzk"
        : streamer.platform === "soop"
          ? "soop"
          : "chzzk";

  const infoRows: Array<{ label: string; value: string }> = [
    { label: "생일", value: streamer.birthday || "-" },
    { label: "국적", value: streamer.nationality || "-" },
    { label: "성별", value: streamer.gender || "-" },
    { label: "장르", value: streamer.genre?.join(", ") || "-" },
    { label: "첫 방송일", value: streamer.first_stream_date || "-" },
    { label: "팬덤명", value: streamer.fandom_name || "-" },
    { label: "MBTI", value: streamer.mbti || "-" },
    { label: "별명", value: streamer.alias?.join(", ") || "-" },
  ];

  const platformHref =
    streamer.platform_url ||
    (canonicalPlatform === "chzzk" && streamer.chzzk_id
      ? `https://chzzk.naver.com/live/${streamer.chzzk_id}`
      : canonicalPlatform === "soop" && streamer.soop_id
        ? `https://www.sooplive.co.kr/station/${streamer.soop_id}`
        : "");

  const platformIconSrc =
    canonicalPlatform === "chzzk" ? "/icons/chzzk.svg" : "/icons/soop.svg";

  const toneContainerClass =
    canonicalPlatform === "chzzk"
      ? "border-green-100 bg-green-50/30"
      : "border-blue-100 bg-blue-50/30";
  const tonePanelClass =
    canonicalPlatform === "chzzk"
      ? "border-green-100 bg-green-50/40"
      : "border-blue-100 bg-blue-50/40";
  const toneButtonClass =
    canonicalPlatform === "chzzk"
      ? "border-green-200 bg-green-50 hover:bg-green-100"
      : "border-blue-200 bg-blue-50 hover:bg-blue-100";
  const groupNameByCode = new Map<string, string>();
  (idolGroups || []).forEach((group) => {
    groupNameByCode.set(group.group_code.trim().toLowerCase(), group.name);
  });
  const groupTags =
    streamer.group_name
      ?.filter((group: unknown): group is string => Boolean(group))
      .map((group: string) => {
        const code = group.trim().toLowerCase();
        return {
          code,
          name: groupNameByCode.get(code) || group,
        };
      }) ?? [];
  const crewTags = streamer.crew_name?.filter(Boolean) ?? [];
  const identityTags = [
    ...groupTags.map((group: { code: string; name: string }) => ({
      type: "group" as const,
      name: group.name,
      href: `/group/${group.code}`,
    })),
    ...crewTags.map((name: string) => ({ type: "crew" as const, name })),
  ];

  const openInfoEditRequestModal = () => {
    if (!user) {
      toast.error("로그인 후 정보 수정 요청이 가능합니다.");
      return;
    }
    setIsEditRequestModalOpen(true);
  };

  const closeInfoEditRequestModal = () => {
    setIsEditRequestModalOpen(false);
    setEditRequestContent("");
  };

  const handleSubmitInfoEditRequest = async () => {
    if (!user) {
      toast.error("로그인 후 정보 수정 요청이 가능합니다.");
      return;
    }
    if (!editRequestContent.trim()) {
      toast.error(STREAMER_INFO_EDIT_REQUEST_MODAL_TEXT.contentRequired);
      return;
    }

    try {
      await createInfoEditRequest({
        content: editRequestContent,
        streamerId: streamer.id,
        streamerNickname: streamer.nickname || "-",
        requesterId: user.id,
        requesterNickname: profile?.nickname || null,
      });
      toast.success(STREAMER_INFO_EDIT_REQUEST_MODAL_TEXT.submitSuccess);
      closeInfoEditRequestModal();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "정보 수정 요청 접수에 실패했습니다.";
      toast.error(message);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <div className="group relative">
          <Link href="/vlist">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="cursor-pointer h-10 w-10"
            >
              <ArrowBigLeft className="w-5 h-5" />
            </Button>
          </Link>
          <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
            뒤로가기
          </span>
        </div>

        <div className="group relative">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="cursor-pointer h-10 w-10"
            onClick={openInfoEditRequestModal}
            disabled={!user}
          >
            <UserRoundPen className="w-5 h-5" />
          </Button>
          <span className="pointer-events-none absolute right-1/2 top-full z-20 mt-1 translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
            정보수정요청
          </span>
        </div>
      </div>

      <div className={`rounded-3xl border p-5 md:p-7 shadow-sm space-y-6 ${toneContainerClass}`}>
        <div className="flex flex-col gap-6 md:flex-row md:items-start">
          <div className="mx-auto md:mx-0 flex shrink-0 flex-col items-center gap-3">
            <div className="relative h-40 w-40 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
              {streamer.image_url ? (
                <Image
                  src={streamer.image_url}
                  alt={streamer.nickname || "streamer"}
                  fill
                  className="object-cover"
                  sizes="160px"
                />
              ) : (
                <div className="h-full w-full" />
              )}
            </div>
            <div className="flex items-center gap-2">
              {platformHref ? (
                <a
                  href={platformHref}
                  target="_blank"
                  rel="noreferrer"
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${toneButtonClass}`}
                  aria-label="플랫폼 이동"
                >
                  <Image src={platformIconSrc} alt="platform" width={18} height={18} />
                </a>
              ) : null}
              {streamer.youtube_url ? (
                <a
                  href={streamer.youtube_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-red-200 bg-red-50 hover:bg-red-100"
                  aria-label="유튜브 이동"
                >
                  <Image src="/icons/youtube.svg" alt="youtube" width={18} height={18} />
                </a>
              ) : null}
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-6">
            <div className="mt-1">
              <p className="text-3xl font-bold text-gray-900 break-all">
                {streamer.nickname || "-"}
              </p>
              {identityTags.length > 0 ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {identityTags.map((tag) => (
                    tag.type === "group" ? (
                      <Link
                        key={`${tag.type}-${tag.name}`}
                        href={tag.href}
                        className="inline-flex items-center rounded-full border border-pink-100 bg-pink-50 px-2.5 py-1 text-xs font-medium text-pink-700 hover:bg-pink-100"
                      >
                        {tag.name}
                      </Link>
                    ) : (
                      <span
                        key={`${tag.type}-${tag.name}`}
                        className="inline-flex items-center rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700"
                      >
                        {tag.name}
                      </span>
                    )
                  ))}
                </div>
              ) : null}
            </div>

            <div className={`grid grid-cols-1 gap-3 rounded-2xl border p-4 md:grid-cols-2 ${tonePanelClass}`}>
              {infoRows.map((row) => (
                <div key={row.label} className="flex items-center gap-2 text-sm">
                  <span className="w-20 shrink-0 text-gray-500">{row.label}</span>
                  <span className="font-medium text-gray-800 break-all">{row.value}</span>
                </div>
              ))}
              <div className="flex items-start gap-2 text-sm">
                <span className="w-20 shrink-0 text-gray-500">그룹</span>
                <span className="font-medium text-gray-800 break-all">
                  {groupTags.length > 0 ? (
                    <span className="inline-flex flex-wrap gap-1.5">
                      {groupTags.map((group: { code: string; name: string }) => (
                        <Link
                          key={`group-link-${group.code}`}
                          href={`/group/${group.code}`}
                          className="underline-offset-2 hover:underline"
                        >
                          {group.name}
                        </Link>
                      ))}
                    </span>
                  ) : (
                    "-"
                  )}
                </span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <span className="w-20 shrink-0 text-gray-500">크루</span>
                <span className="font-medium text-gray-800 break-all">
                  {streamer.crew_name?.join(", ") || "-"}
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {isEditRequestModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">
              {STREAMER_INFO_EDIT_REQUEST_MODAL_TEXT.title}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {STREAMER_INFO_EDIT_REQUEST_MODAL_TEXT.description}
            </p>

            <textarea
              value={editRequestContent}
              onChange={(event) => setEditRequestContent(event.target.value)}
              placeholder="수정이 필요한 내용을 입력해 주세요."
              className="mt-4 h-32 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            />

            <div className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={closeInfoEditRequestModal}
                disabled={isInfoEditRequestSubmitting}
              >
                {STREAMER_INFO_EDIT_REQUEST_MODAL_TEXT.cancelButton}
              </Button>
              <Button
                type="button"
                className="cursor-pointer bg-gray-800 text-white hover:bg-gray-900"
                onClick={handleSubmitInfoEditRequest}
                disabled={isInfoEditRequestSubmitting}
              >
                {isInfoEditRequestSubmitting
                  ? "처리중..."
                  : STREAMER_INFO_EDIT_REQUEST_MODAL_TEXT.submitButton}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
