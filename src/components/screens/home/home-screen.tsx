"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { UserRound } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useLiveStreamers } from "@/hooks/queries/live/use-live-streamers";

export default function HomeScreen() {
  const { data, isLoading } = useLiveStreamers();

  const topLiveStreamers = useMemo(() => {
    const source = data || [];
    return source
      .filter((item) => item.isLive)
      .sort((a, b) => (b.viewerCount ?? 0) - (a.viewerCount ?? 0))
      .slice(0, 4);
  }, [data]);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <section className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
        <h2 className="text-lg font-semibold text-gray-800">배너 영역</h2>
        <p className="mt-2 text-sm text-gray-500">
          버추얼 광고(생일, 앨범홍보, 컨텐츠홍보) 배너등록 준비중
        </p>
      </section>

      <section className="p-4 md:p-6">
        {isLoading ? (
          <div className="flex min-h-40 items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="inline-flex items-center justify-center rounded-full bg-red-600 px-2 py-0.5 text-[10px] text-white">
                  라이브
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[0, 1, 2, 3].map((index) => {
                  const streamer = topLiveStreamers[index];
                  if (!streamer) {
                    return (
                      <div
                        key={`live-empty-${index}`}
                        className="rounded-xl p-2 text-center"
                      >
                        <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-50">
                          <UserRound className="h-7 w-7 text-gray-300" />
                        </div>
                        <p className="truncate text-xs text-gray-400">대기중</p>
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
                          className={`mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full border-2 bg-gray-100 p-0.5 ${ringClass}`}
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
                      <p className="truncate text-xs font-semibold text-gray-900">
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
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[0, 1, 2, 3].map((index) => (
                  <div key={`favorite-${index}`} className="rounded-xl p-2 text-center">
                    <div className="mx-auto mb-2 flex h-20 w-20 items-center justify-center rounded-full border-2 border-gray-200 bg-gray-50">
                      <UserRound className="h-7 w-7 text-gray-300" />
                    </div>
                    <p className="truncate text-xs text-gray-400">준비중</p>
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
