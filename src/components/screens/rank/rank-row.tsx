import Link from "next/link";
import { Heart, Trophy, UserRound } from "lucide-react";
import PlatformBadge from "@/components/common/platform-badge";
import type { RankRowProps } from "@/types/rank-screen";

export default function RankRow({ item, rankNumber, groupNameByCode, crewNameByCode }: RankRowProps) {
  const groupTags = (item.group_name || [])
    .filter(Boolean)
    .map((group) => groupNameByCode.get(group.trim().toLowerCase()) || group);
  const crewTags = (item.crew_name || [])
    .filter(Boolean)
    .map((crew) => crewNameByCode.get(crew.trim().toLowerCase()) || crew);

  const trophyClassName =
    rankNumber === 1
      ? "text-yellow-500"
      : rankNumber === 2
        ? "text-gray-400"
        : rankNumber === 3
          ? "text-amber-700"
          : "";

  return (
    <Link
      href={`/vlist/${item.public_id ?? item.streamer_id}`}
      className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 py-2 transition hover:border-gray-400 hover:bg-gray-50/40"
    >
      <span className="inline-flex w-10 shrink-0 items-center justify-center text-center text-sm font-semibold text-gray-700">
        {rankNumber <= 3 ? <Trophy className={`h-5 w-5 ${trophyClassName}`} /> : `${rankNumber}위`}
      </span>

      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.nickname || "streamer"}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <UserRound className="h-5 w-5 text-gray-300" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-gray-900">
            {item.nickname || "이름 미등록"}
          </p>
          {item.platform ? <PlatformBadge platform={item.platform} /> : null}
        </div>
        {groupTags.length > 0 || crewTags.length > 0 ? (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {groupTags.map((group) => (
              <span
                key={`${item.streamer_id}-group-${group}`}
                className="inline-flex items-center rounded-full border border-pink-100 bg-pink-50 px-2 py-0.5 text-[10px] font-medium text-pink-700"
              >
                {group}
              </span>
            ))}
            {crewTags.map((crew) => (
              <span
                key={`${item.streamer_id}-crew-${crew}`}
                className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-medium text-sky-700"
              >
                {crew}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600">
        <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
        {item.total_received.toLocaleString()}
      </div>
    </Link>
  );
}

