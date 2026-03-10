import Link from "next/link";
import { ExternalLink, Eye, UserRound } from "lucide-react";
import SupportersBadge from "@/components/common/supporters-badge";
import StreamerGroupCrewBadges from "@/components/common/streamer-group-crew-badges";
import type { LiveStreamer } from "@/types/live";

type LiveStreamerCardProps = {
  streamer: LiveStreamer;
  /** 첫 번째 카드 여부 — true이면 이미지를 eager 로딩한다 */
  eager: boolean;
  /** 라이브 썸네일이 깨졌는지 판별하는 콜백 */
  isBroken: (id: number, version?: string) => boolean;
  /** 라이브 썸네일 깨짐을 기록하는 콜백 */
  markBroken: (id: number, version?: string) => void;
  groupNameByCode: Map<string, string>;
  crewNameByCode: Map<string, string>;
};

/** 라이브 중인 스트리머 한 장의 카드 UI */
export default function LiveStreamerCard({
  streamer,
  eager,
  isBroken,
  markBroken,
  groupNameByCode,
  crewNameByCode,
}: LiveStreamerCardProps) {
  const liveThumbSrc = streamer.liveThumbnailImageUrl || "";
  const fallbackSrc = streamer.image_url || "";
  const hasLiveThumb = Boolean(liveThumbSrc);
  const useFallback = isBroken(streamer.id, liveThumbSrc);
  const imageSrc = useFallback ? fallbackSrc : liveThumbSrc || fallbackSrc;
  const isLiveThumb = hasLiveThumb && !useFallback;

  return (
    <Link
      href={streamer.liveUrl}
      target="_blank"
      rel="noreferrer"
      className={`group rounded-xl border bg-white p-2.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        streamer.platform === "chzzk"
          ? "border-green-200"
          : "border-blue-200"
      }`}
    >
      {/* 썸네일: onError fallback이 필요하므로 <img> 유지 */}
      <div className="relative mb-2 h-28 overflow-hidden rounded-lg bg-gray-100">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={streamer.nickname || "streamer"}
            loading={eager ? "eager" : "lazy"}
            onError={() => {
              if (hasLiveThumb && !useFallback && fallbackSrc) {
                markBroken(streamer.id, liveThumbSrc);
              }
            }}
            className="absolute inset-0 h-full w-full object-cover transition group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <UserRound className="h-7 w-7 text-gray-300" />
          </div>
        )}

        <span className="absolute left-2 top-2 rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold text-white">
          LIVE
        </span>
        {isLiveThumb ? (
          <span className="absolute right-2 top-2 rounded-full bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white">
            LIVE THUMB
          </span>
        ) : null}
      </div>

      <div className="mb-1 flex items-center justify-between gap-1">
        <p className="truncate text-sm font-semibold text-gray-900">
          {streamer.nickname || "이름 미등록"}
        </p>
        <div className="ml-2 flex shrink-0 items-center gap-1">
          <span
            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
              streamer.platform === "chzzk"
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
            }`}
          >
            {streamer.platform?.toUpperCase() || "UNKNOWN"}
          </span>
          <SupportersBadge supporters={streamer.supporters} />
        </div>
      </div>

      {streamer.liveTitle ? (
        <p className="mb-1 truncate text-[11px] text-gray-500">
          {streamer.liveTitle}
        </p>
      ) : null}

      <div className="mb-1 flex items-center justify-between text-[11px] text-gray-500">
        <span className="inline-flex items-center gap-1">
          <Eye className="h-3.5 w-3.5" />
          {(streamer.viewerCount ?? 0).toLocaleString()}명
        </span>
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 text-gray-500">
          <ExternalLink className="h-3 w-3" />
        </span>
      </div>

      <StreamerGroupCrewBadges
        streamerId={streamer.id}
        groupNames={streamer.group_name}
        crewNames={streamer.crew_name}
        groupNameByCode={groupNameByCode}
        crewNameByCode={crewNameByCode}
      />
    </Link>
  );
}
