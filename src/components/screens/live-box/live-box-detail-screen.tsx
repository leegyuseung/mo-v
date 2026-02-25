"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowBigLeft, CalendarClock, ExternalLink, Tag, UserRound, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { LiveStreamer } from "@/types/live";
import type { LiveBox, LiveBoxParticipantProfile } from "@/types/live-box";

type LiveBoxDetailScreenProps = {
  liveBox: LiveBox | null;
  participantProfiles: LiveBoxParticipantProfile[];
  liveStreamers: LiveStreamer[];
  hasLiveBoxError?: boolean;
  hasParticipantProfilesError?: boolean;
  hasLiveStreamersError?: boolean;
};

function formatEndsAt(value: string | null) {
  if (!value) return "미설정";

  return new Date(value).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function getStatusBadgeClass(status: string) {
  if (status === "진행중") return "bg-green-50 text-green-700 border-green-200";
  if (status === "종료") return "bg-gray-100 text-gray-600 border-gray-200";
  return "bg-amber-50 text-amber-700 border-amber-200";
}

export default function LiveBoxDetailScreen({
  liveBox,
  participantProfiles,
  liveStreamers,
  hasLiveBoxError = false,
  hasParticipantProfilesError = false,
  hasLiveStreamersError = false,
}: LiveBoxDetailScreenProps) {
  const [participantKeyword, setParticipantKeyword] = useState("");

  const participantByPlatformId = useMemo(() => {
    const map = new Map<
      string,
      {
        nickname: string | null;
        imageUrl: string | null;
        platform: "chzzk" | "soop";
      }
    >();

    participantProfiles.forEach((profile) => {
      if (profile.chzzk_id) {
        map.set(profile.chzzk_id, {
          nickname: profile.nickname,
          imageUrl: profile.image_url,
          platform: "chzzk",
        });
      }
      if (profile.soop_id) {
        map.set(profile.soop_id, {
          nickname: profile.nickname,
          imageUrl: profile.image_url,
          platform: "soop",
        });
      }
    });

    return map;
  }, [participantProfiles]);

  const liveByPlatformId = useMemo(() => {
    const map = new Map<string, { liveUrl: string; viewerCount: number | null }>();

    liveStreamers.forEach((streamer) => {
      if (!streamer.isLive || !streamer.liveUrl) return;

      const liveInfo = {
        liveUrl: streamer.liveUrl,
        viewerCount: streamer.viewerCount ?? null,
      };

      if (streamer.chzzk_id) {
        map.set(streamer.chzzk_id, liveInfo);
      }

      if (streamer.soop_id) {
        map.set(streamer.soop_id, liveInfo);
      }
    });

    return map;
  }, [liveStreamers]);

  const filteredParticipantIds = useMemo(() => {
    if (!liveBox) return [];

    const keyword = participantKeyword.trim().toLowerCase();
    if (!keyword) return liveBox.participant_streamer_ids;

    return liveBox.participant_streamer_ids.filter((platformId) => {
      const participant = participantByPlatformId.get(platformId);
      const nickname = (participant?.nickname || "").toLowerCase();
      return nickname.includes(keyword);
    });
  }, [liveBox, participantKeyword, participantByPlatformId]);

  if (hasLiveBoxError) {
    return (
      <div className="mx-auto max-w-4xl p-4 md:p-6">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-sm text-red-700">
          라이브박스 상세 정보를 불러오지 못했습니다.
        </div>
      </div>
    );
  }

  if (!liveBox) {
    return (
      <div className="mx-auto max-w-4xl p-4 md:p-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          존재하지 않는 라이브박스입니다.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-6">
      <Link
        href="/live-box"
        className="group relative inline-flex h-10 w-10 items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        aria-label="뒤로가기"
      >
        <ArrowBigLeft className="h-4 w-4" />
        <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
          뒤로가기
        </span>
      </Link>

      <article className="mt-4 rounded-2xl border border-gray-200 bg-white p-5 md:p-6">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
          <h1 className="text-2xl font-semibold text-gray-900">{liveBox.title}</h1>
          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusBadgeClass(
              liveBox.status
            )}`}
          >
            {liveBox.status}
          </span>
        </div>

        <div className="mb-4 flex justify-end">
          <Input
            value={participantKeyword}
            onChange={(event) => setParticipantKeyword(event.target.value)}
            placeholder="참여자 검색 (닉네임)"
            className="h-9 w-full md:w-80"
          />
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-1.5 text-sm text-gray-600">
          <Tag className="h-4 w-4" />
          {liveBox.category.length > 0 ? (
            liveBox.category.map((item) => (
              <span
                key={`${liveBox.id}-detail-category-${item}`}
                className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs"
              >
                {item}
              </span>
            ))
          ) : (
            <span>-</span>
          )}
        </div>

        <p className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm text-gray-700">
          {liveBox.description?.trim() || "설명이 없습니다."}
        </p>

        <div className="mt-5 grid grid-cols-1 gap-2 text-sm text-gray-700 md:grid-cols-2">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4 text-gray-400" />
            <span>참여자 수 {liveBox.participant_streamer_ids.length.toLocaleString()}명</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CalendarClock className="h-4 w-4 text-gray-400" />
            <span>마감일시 {formatEndsAt(liveBox.ends_at)}</span>
          </div>
        </div>

        <div className="mt-5 border-t border-gray-100 pt-4">
          <p className="mb-2 text-sm font-medium text-gray-700">참여자</p>
          <div className="max-h-80 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {liveBox.participant_streamer_ids.length > 0 ? (
                filteredParticipantIds.map((platformId) => {
                  const participant = participantByPlatformId.get(platformId);
                  const liveInfo = liveByPlatformId.get(platformId);
                  const isLive = Boolean(liveInfo?.liveUrl);
                  const participantBorderClass =
                    participant?.platform === "chzzk"
                      ? "border-2 border-green-400"
                      : participant?.platform === "soop"
                        ? "border-2 border-blue-400"
                        : "border-2 border-gray-300";

                  const content = (
                    <>
                      <div
                        className={`relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border bg-gray-100 ${participantBorderClass}`}
                      >
                        {participant?.imageUrl ? (
                          <Image
                            src={participant.imageUrl}
                            alt={participant.nickname || platformId}
                            fill
                            sizes="32px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <UserRound className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate text-sm text-gray-700">
                            {participant?.nickname || "이름 미등록"}
                          </span>
                          {isLive ? (
                            <span className="inline-flex items-center rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                              LIVE
                            </span>
                          ) : null}
                        </div>
                        {isLive ? (
                          <span className="text-xs text-gray-500">
                            {(liveInfo?.viewerCount ?? 0).toLocaleString()}명 시청 중
                          </span>
                        ) : null}
                      </div>
                      {isLive ? <ExternalLink className="ml-auto h-3.5 w-3.5 text-gray-400" /> : null}
                    </>
                  );

                  if (isLive && liveInfo) {
                    return (
                      <Link
                        key={`${liveBox.id}-detail-participant-${platformId}`}
                        href={liveInfo.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-red-100 bg-red-50/40 px-3 py-2 hover:bg-red-50"
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <div
                      key={`${liveBox.id}-detail-participant-${platformId}`}
                      className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2"
                    >
                      {content}
                    </div>
                  );
                })
              ) : (
                <p className="text-sm text-gray-400">참여자가 없습니다.</p>
              )}
            </div>
          </div>

          {liveBox.participant_streamer_ids.length > 0 && filteredParticipantIds.length === 0 ? (
            <p className="mt-2 text-sm text-gray-400">검색 결과가 없습니다.</p>
          ) : null}
          {hasParticipantProfilesError ? (
            <p className="mt-2 text-xs text-amber-700">
              참여자 일부는 프로필 정보를 찾지 못해 기본 아이콘으로 표시됩니다.
            </p>
          ) : null}
          {hasLiveStreamersError ? (
            <p className="mt-2 text-xs text-amber-700">
              라이브 상태를 확인하지 못해 LIVE 라벨이 일부 표시되지 않을 수 있습니다.
            </p>
          ) : null}
        </div>
      </article>
    </div>
  );
}
