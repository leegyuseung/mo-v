import Image from "next/image";
import Link from "next/link";
import { UserRound } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { generateArray } from "@/utils/array";
import type { HomeLiveStarSectionProps } from "@/types/home-screen";

export default function HomeLiveStarSection({
  isLiveLoading,
  topLiveStreamers,
  isLoggedIn,
  starredStreamerIds,
  liveFavoriteStreamers,
}: HomeLiveStarSectionProps) {
  return (
    <section className="p-4 md:p-6">
      {isLiveLoading ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {generateArray(2).map((_, cardIndex) => (
            <div
              key={`home-live-skeleton-card-${cardIndex}`}
              className="rounded-2xl border border-gray-100 bg-white p-4"
            >
              <Skeleton className="mb-4 h-5 w-16 rounded-full" />
              <div className="grid grid-cols-4 gap-2 md:gap-3">
                {generateArray(4).map((_, slotIndex) => (
                  <div
                    key={`home-live-skeleton-slot-${cardIndex}-${slotIndex}`}
                    className="rounded-xl p-2 text-center"
                  >
                    <Skeleton className="mx-auto mb-2 h-14 w-14 rounded-full md:h-20 md:w-20" />
                    <Skeleton className="mx-auto hidden h-3 w-16 md:block" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="inline-flex items-center justify-center rounded-full bg-red-600 px-2 py-0.5 text-[10px] text-white">
                LIVE
              </span>
              <Link
                href="/live"
                className="text-xs font-medium text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline"
              >
                전체
              </Link>
            </div>
            {topLiveStreamers.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">
                라이브중인 버츄얼이 없습니다.
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 md:gap-3">
                {generateArray(4).map((_, index) => {
                  const streamer = topLiveStreamers[index];
                  if (!streamer) {
                    return (
                      <div
                        key={`live-empty-${index}`}
                        className="rounded-xl p-2 text-center"
                      >
                        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-50/70 md:h-20 md:w-20">
                          <UserRound className="h-5 w-5 text-gray-300 md:h-7 md:w-7" />
                        </div>
                        <p className="hidden truncate text-xs text-transparent md:block">.</p>
                      </div>
                    );
                  }

                  const ringClass =
                    streamer.platform === "chzzk"
                      ? "border-green-500"
                      : "border-blue-500";

                  return (
                    <div key={streamer.id} className="rounded-xl p-2 text-center">
                      <Link
                        href={streamer.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="group inline-flex cursor-pointer"
                      >
                        <div
                          className={`mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full border-2 bg-gray-100 p-0.5 md:h-20 md:w-20 ${ringClass}`}
                        >
                          <div className="relative h-full w-full overflow-hidden rounded-full">
                            {streamer.image_url ? (
                              <Image
                                src={streamer.image_url}
                                alt={streamer.nickname || "streamer"}
                                fill
                                sizes="(min-width: 768px) 80px, 56px"
                                priority={index === 0}
                                loading={index === 0 ? "eager" : "lazy"}
                                className="object-cover transition-transform duration-200 group-hover:scale-110"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <UserRound className="h-7 w-7 text-gray-300" />
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                      <p className="hidden truncate text-xs font-semibold text-gray-900 md:block">
                        {streamer.nickname || "이름 미등록"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <span className="inline-flex items-center justify-center rounded-full bg-yellow-500 px-2 py-0.5 text-[10px] text-white">
                STAR
              </span>
              <Link
                href="/star"
                className="text-xs font-medium text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline"
              >
                전체
              </Link>
            </div>
            {!isLoggedIn ? (
              <div className="py-8 text-center text-sm text-gray-400">로그인 후 이용해 주세요.</div>
            ) : starredStreamerIds.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-500">
                <Link href="/vlist" className="underline underline-offset-2 hover:text-gray-700">
                  즐겨찾기하러가기
                </Link>
              </div>
            ) : liveFavoriteStreamers.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">
                즐겨찾기한 버츄얼 중 라이브 중인 버츄얼이 없습니다.
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 md:gap-3">
                {generateArray(4).map((_, index) => {
                  const streamer = liveFavoriteStreamers[index];
                  if (!streamer) {
                    return (
                      <div key={`favorite-empty-${index}`} className="rounded-xl p-2 text-center">
                        <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-50 md:h-20 md:w-20">
                          <UserRound className="h-5 w-5 text-gray-300 md:h-7 md:w-7" />
                        </div>
                        <p className="hidden truncate text-xs text-transparent md:block">.</p>
                      </div>
                    );
                  }

                  const ringClass =
                    streamer.platform === "chzzk"
                      ? "border-green-500"
                      : "border-blue-500";

                  return (
                    <div key={`favorite-live-${streamer.id}`} className="rounded-xl p-2 text-center">
                      <Link
                        href={streamer.liveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="group inline-flex cursor-pointer"
                      >
                        <div
                          className={`mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full border-2 bg-gray-100 p-0.5 md:h-20 md:w-20 ${ringClass}`}
                        >
                          <div className="relative h-full w-full overflow-hidden rounded-full">
                            {streamer.image_url ? (
                              <Image
                                src={streamer.image_url}
                                alt={streamer.nickname || "streamer"}
                                fill
                                sizes="(min-width: 768px) 80px, 56px"
                                loading="lazy"
                                className="object-cover transition-transform duration-200 group-hover:scale-110"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <UserRound className="h-7 w-7 text-gray-300" />
                              </div>
                            )}
                          </div>
                        </div>
                      </Link>
                      <p className="hidden truncate text-xs font-semibold text-gray-900 md:block">
                        {streamer.nickname || "이름 미등록"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
