import Image from "next/image";
import Link from "next/link";
import { Trophy, UserRound } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { generateArray } from "@/utils/array";
import type { StreamerHeartLeaderboardItem } from "@/types/heart";
import type { HomeHeartRankSectionProps } from "@/types/home-screen";

function getRankRows(items: StreamerHeartLeaderboardItem[]) {
  return items.filter((item) => (item.total_received ?? 0) > 0).slice(0, 5);
}

function getTopRankRowClass(index: number) {
  if (index === 0) {
    return "border-yellow-300 bg-gradient-to-r from-yellow-50 via-amber-50 to-white";
  }
  if (index === 1) {
    return "border-slate-300 bg-gradient-to-r from-slate-50 via-gray-50 to-white";
  }
  if (index === 2) {
    return "border-[#B87333] bg-gradient-to-r from-[#FFF8F2] via-[#F1E1D1] to-white";
  }
  return "border-gray-100 bg-white";
}

function getTopRankTrophyClass(index: number) {
  if (index === 0) return "text-yellow-500";
  if (index === 1) return "text-gray-400";
  if (index === 2) return "text-[#8B5A2B]";
  return "text-gray-400";
}

export default function HomeHeartRankSection({ rankCards }: HomeHeartRankSectionProps) {
  return (
    <section className="p-4 md:p-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
        {rankCards.map((card) => (
          <div
            key={card.key}
            className="rounded-2xl border border-gray-100 bg-white p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">{card.title}</h3>
              <Link
                href={`/rank?period=${card.key}`}
                className="text-xs font-medium text-gray-500 hover:text-gray-700"
              >
                전체
              </Link>
            </div>

            {card.isLoading ? (
              <div className="space-y-3">
                {generateArray(5).map((_, slotIndex) => (
                  <div
                    key={`home-heart-skeleton-${card.key}-${slotIndex}`}
                    className="flex items-center gap-3"
                  >
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : card.isError ? (
              <div className="py-8 text-center text-sm text-gray-400">
                랭킹 조회에 실패했습니다.
              </div>
            ) : (
              <div className="space-y-0.5">
                {generateArray(5).map((_, index) => {
                  const item = getRankRows(card.data)[index];
                  if (!item) {
                    return (
                      <div
                        key={`${card.key}-empty-${index}`}
                        className="flex items-center gap-3 rounded-xl px-2 py-1.5"
                      >
                        <span className="w-7 text-xs font-bold text-gray-300">
                          {index + 1}위
                        </span>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100">
                          <UserRound className="h-4 w-4 text-gray-300" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-300">-</p>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={`${card.key}-${item.streamer_id}`}
                      href={`/vlist/${item.public_id ?? item.streamer_id}`}
                      className={`group flex items-center gap-3 rounded-xl border px-2 py-1.5 transition hover:border-gray-300 hover:bg-gray-50 ${getTopRankRowClass(
                        index
                      )}`}
                    >
                      <span className="inline-flex w-7 items-center justify-center text-xs font-bold text-gray-500">
                        {index < 3 ? (
                          <Trophy className={`h-4 w-4 ${getTopRankTrophyClass(index)}`} />
                        ) : (
                          `${index + 1}위`
                        )}
                      </span>
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-gray-100">
                        {item.image_url ? (
                          <Image
                            src={item.image_url}
                            alt={item.nickname || "virtual"}
                            fill
                            sizes="36px"
                            loading="lazy"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <UserRound className="h-4 w-4 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {item.nickname || "이름 미등록"}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
