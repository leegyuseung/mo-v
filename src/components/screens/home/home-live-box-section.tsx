"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CalendarClock, ChevronLeft, ChevronRight, Tag, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { generateArray } from "@/utils/array";
import {
  formatEndsAt,
  getStatusBadgeClass,
} from "@/components/screens/home/home-section-helpers";
import type { HomeLiveBoxSectionProps } from "@/types/home-screen";

export default function HomeLiveBoxSection({
  isLiveBoxLoading,
  isLiveBoxError,
  topLiveBoxes,
}: HomeLiveBoxSectionProps) {
  const LIVE_BOX_PAGE_SIZE = 3;
  const [boxPage, setBoxPage] = useState(0);
  const boxTotalPages = Math.max(1, Math.ceil(topLiveBoxes.length / LIVE_BOX_PAGE_SIZE));
  const currentBoxPage = Math.min(boxPage, boxTotalPages - 1);
  const visibleBoxes = useMemo(() => {
    const start = currentBoxPage * LIVE_BOX_PAGE_SIZE;
    return topLiveBoxes.slice(start, start + LIVE_BOX_PAGE_SIZE);
  }, [currentBoxPage, topLiveBoxes]);

  return (
    <section className="p-4 md:p-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <span className="inline-flex items-center justify-center rounded-full bg-violet-600 px-2 py-0.5 text-[10px] text-white">
            LIVE BOX
          </span>
          <div className="flex items-center gap-2">
            <Link
              href="/live-box"
              className="text-xs font-medium text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline"
            >
              전체
            </Link>
            {boxTotalPages > 1 ? (
              <>
                <button
                  type="button"
                  aria-label="라이브박스 이전"
                  onClick={() => setBoxPage((prev) => Math.max(0, prev - 1))}
                  disabled={currentBoxPage === 0}
                  className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="라이브박스 다음"
                  onClick={() => setBoxPage((prev) => Math.min(boxTotalPages - 1, prev + 1))}
                  disabled={currentBoxPage >= boxTotalPages - 1}
                  className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            ) : null}
          </div>
        </div>

        {isLiveBoxLoading ? (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {generateArray(3).map((_, i) => (
              <div key={`home-livebox-skeleton-${i}`} className="rounded-xl border border-gray-100 p-3 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        ) : isLiveBoxError ? (
          <div className="py-8 text-center text-sm text-gray-400">
            라이브박스를 불러오지 못했습니다.
          </div>
        ) : topLiveBoxes.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-400">진행중인 라이브박스가 없습니다.</div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {visibleBoxes.map((box) => (
              <Link
                key={box.id}
                href={`/live-box/${box.id}`}
                className="group block rounded-xl border border-gray-200 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-gray-300 hover:bg-gray-50/40 hover:shadow-[0_14px_28px_-14px_rgba(0,0,0,0.45)]"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{box.title}</h4>
                  <span
                    className={`shrink-0 rounded-full border px-1.5 py-0.5 text-[10px] font-medium ${getStatusBadgeClass(box.status)}`}
                  >
                    {box.status}
                  </span>
                </div>

                <div className="mb-2 flex items-center gap-1 text-xs text-gray-500">
                  <Tag className="h-3 w-3 shrink-0" />
                  <div className="flex flex-wrap gap-1 min-w-0">
                    {box.category.length > 0 ? (
                      box.category.map((item) => (
                        <span
                          key={`home-lb-${box.id}-cat-${item}`}
                          className="rounded-full border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px]"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <span>-</span>
                    )}
                  </div>
                </div>

                <p className="mb-3 truncate text-xs text-gray-500">
                  {box.description?.trim() || "설명이 없습니다."}
                </p>

                <div className="flex items-center gap-3 text-[11px] text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Users className="h-3 w-3 text-gray-400" />
                    {box.participant_streamer_ids.length}명
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock className="h-3 w-3 text-gray-400" />
                    {formatEndsAt(box.ends_at)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
