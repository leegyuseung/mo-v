"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import StarCountBadge from "@/components/common/star-count-badge";

type IdentityTag = {
  type: "group" | "crew";
  name: string;
  href: string;
};

type GroupTag = { code: string; name: string };
type CrewLinkItem = { code: string; name: string };

type StreamerProfileCardProps = {
  streamer: {
    nickname: string | null;
    image_url: string | null;
    birthday: string | null;
    nationality: string | null;
    gender: string | null;
    genre: string[] | null;
    first_stream_date: string | null;
    fandom_name: string | null;
    mbti: string | null;
    alias: string[] | null;
    platform_url: string | null;
    fancafe_url: string | null;
    youtube_url: string | null;
  };
  canonicalPlatform: "chzzk" | "soop";
  platformHref: string;
  platformIconSrc: string;
  toneContainerClass: string;
  tonePanelClass: string;
  toneButtonClass: string;
  identityTags: IdentityTag[];
  groupTags: GroupTag[];
  crewLinkItems: CrewLinkItem[];
  receivedHeartTotal: number;
  isReceivedHeartTotalLoading: boolean;
  streamerStarCount: number;
  isStreamerStarCountLoading: boolean;
};

/** 버츄얼 프로필 카드: 이미지, 정보, 소속/그룹 태그, 외부 링크 */
export default function StreamerProfileCard({
  streamer,
  canonicalPlatform,
  platformHref,
  platformIconSrc,
  toneContainerClass,
  tonePanelClass,
  toneButtonClass,
  identityTags,
  groupTags,
  crewLinkItems,
  receivedHeartTotal,
  isReceivedHeartTotalLoading,
  streamerStarCount,
  isStreamerStarCountLoading,
}: StreamerProfileCardProps) {
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

  return (
    <div className={`rounded-3xl border p-5 md:p-7 shadow-sm space-y-6 ${toneContainerClass}`}>
      <div className="flex flex-col gap-6 md:flex-row md:items-start">
        {/* 프로필 이미지 + 외부 링크 */}
        <div className="mx-auto md:mx-0 flex shrink-0 flex-col items-center gap-1">
          <div className="relative h-40 w-40 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
            {streamer.image_url ? (
              <Image
                src={streamer.image_url}
                alt={streamer.nickname || "streamer"}
                fill
                priority
                loading="eager"
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
                <img src={platformIconSrc} alt="platform" width={18} height={18} />
              </a>
            ) : null}
            {streamer.fancafe_url ? (
              <a
                href={streamer.fancafe_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-green-200 bg-green-50 hover:bg-green-100"
                aria-label="카페 이동"
              >
                <img src="/icons/cafe.svg" alt="cafe" width={18} height={18} />
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
                <img src="/icons/youtube.svg" alt="youtube" width={18} height={18} />
              </a>
            ) : null}
          </div>
          <div className="mt-1 inline-flex items-center gap-1">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full">
              <Heart className="h-4 w-4 fill-red-500 text-red-500" />
            </span>
            <span className="text-xs font-semibold text-gray-800">
              {isReceivedHeartTotalLoading
                ? "-"
                : receivedHeartTotal.toLocaleString()}
            </span>
          </div>
          <StarCountBadge count={streamerStarCount} isLoading={isStreamerStarCountLoading} />
        </div>

        {/* 정보 패널 */}
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
                    <Link
                      key={`${tag.type}-${tag.name}`}
                      href={tag.href}
                      className="inline-flex items-center rounded-full border border-sky-100 bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700"
                    >
                      {tag.name}
                    </Link>
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
                    {groupTags.map((group) => (
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
              <span className="w-20 shrink-0 text-gray-500">소속</span>
              <span className="font-medium text-gray-800 break-all">
                {crewLinkItems.length > 0 ? (
                  <span className="inline-flex flex-wrap gap-1.5">
                    {crewLinkItems.map((crew) => (
                      <Link
                        key={`crew-link-${crew.code}`}
                        href={`/crew/${encodeURIComponent(crew.code)}`}
                        className="underline-offset-2 hover:underline"
                      >
                        {crew.name}
                      </Link>
                    ))}
                  </span>
                ) : (
                  "-"
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
