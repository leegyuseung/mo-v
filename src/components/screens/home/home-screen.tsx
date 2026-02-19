"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { UserRound } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLiveStreamers } from "@/hooks/queries/live/use-live-streamers";

export default function HomeScreen() {
  const { data, isLoading } = useLiveStreamers();

  const topLiveStreamers = useMemo(() => {
    const source = (data || []).filter((item) => item.isLive);
    const shuffled = [...source];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 4);
  }, [data]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <section className="mx-auto w-full max-w-[1200px]">
        <div className="h-[200px] md:h-[200px] rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center flex flex-col items-center justify-center">
          <h2 className="text-lg font-semibold text-gray-800">배너 영역</h2>
          <p className="mt-2 text-sm text-gray-500">
            버츄얼 광고(생일, 앨범홍보, 컨텐츠홍보) 배너등록 준비중
          </p>
        </div>
      </section>

      <section className="p-4 md:p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {[0, 1].map((cardIndex) => (
              <div
                key={`home-skeleton-card-${cardIndex}`}
                className="rounded-2xl border border-gray-100 bg-white p-4"
              >
                <Skeleton className="mb-4 h-5 w-16 rounded-full" />
                <div className="grid grid-cols-4 gap-2 md:gap-3">
                  {[0, 1, 2, 3].map((slotIndex) => (
                    <div
                      key={`home-skeleton-slot-${cardIndex}-${slotIndex}`}
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
                  라이브
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 md:gap-3">
                {[0, 1, 2, 3].map((index) => {
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
                        className="inline-flex cursor-pointer"
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
                                sizes="80px"
                                className="object-cover"
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
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="inline-flex items-center justify-center rounded-full bg-yellow-500 px-2 py-0.5 text-[10px] text-white">
                  즐겨찾기
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2 md:gap-3">
                {[0, 1, 2, 3].map((index) => (
                  <div key={`favorite-${index}`} className="rounded-xl p-2 text-center">
                    <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-50 md:h-20 md:w-20">
                      <UserRound className="h-5 w-5 text-gray-300 md:h-7 md:w-7" />
                    </div>
                    <p className="hidden truncate text-xs text-gray-400 md:block">준비중</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
