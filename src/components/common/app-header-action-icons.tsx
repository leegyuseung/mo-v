"use client";

import Link from "next/link";
import { Bell, CalendarDays, Gift, Mail, Star } from "lucide-react";

type AppHeaderActionIconsProps = {
  onClickGiftEvent: () => void;
  onOpenSchedule: () => void;
};

export default function AppHeaderActionIcons({
  onClickGiftEvent,
  onOpenSchedule,
}: AppHeaderActionIconsProps) {
  return (
    <>
      <div className="group relative">
        <Link
          href="/star"
          aria-label="즐겨찾기"
          className="h-9 w-9 md:h-10 md:w-10 inline-flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer"
        >
          <Star className="w-4 h-4 text-black" />
        </Link>
        <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hidden md:block">
          즐겨찾기
        </span>
      </div>
      <div className="group relative">
        <button
          type="button"
          aria-label="선물 이벤트"
          onClick={onClickGiftEvent}
          className="h-9 w-9 md:h-10 md:w-10 inline-flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer"
        >
          <Gift className="w-4 h-4 text-black" />
        </button>
        <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hidden md:block">
          선물 이벤트 (1~50하트)
        </span>
      </div>
      <div className="group relative">
        <button
          type="button"
          aria-label="콘텐츠 일정"
          onClick={onOpenSchedule}
          className="h-9 w-9 md:h-10 md:w-10 inline-flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-50 cursor-pointer"
        >
          <CalendarDays className="w-4 h-4 text-black" />
        </button>
        <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 hidden md:block">
          콘텐츠 일정
        </span>
      </div>
    </>
  );
}

