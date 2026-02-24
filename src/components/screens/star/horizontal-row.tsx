"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import type { HorizontalRowProps } from "@/types/star";

/** 가로 스크롤 행: 제목, 검색, 수정/추가, 좌우 스크롤 버튼을 포함한다 */
export default function HorizontalRow({
  title,
  emptyText,
  searchValue,
  onSearchChange,
  addHref,
  isEditable = false,
  isEditMode = false,
  onToggleEditMode,
  children,
}: HorizontalRowProps) {
  const rowRef = useRef<HTMLDivElement | null>(null);

  /** 가로 스크롤 이동량 */
  const scrollByAmount = (amount: number) => {
    rowRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
        <div className="flex items-center gap-2">
          <Input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="이름 검색"
            className="h-7 w-32 rounded-md border-gray-200 text-xs"
          />
          {isEditable && addHref ? (
            <Link
              href={addHref}
              className="inline-flex h-7 items-center rounded-md border border-gray-200 px-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              추가
            </Link>
          ) : null}
          {isEditable ? (
            <button
              type="button"
              onClick={onToggleEditMode}
              className="inline-flex h-7 cursor-pointer items-center rounded-md border border-gray-200 px-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              {isEditMode ? "완료" : "수정"}
            </button>
          ) : null}
          <button
            type="button"
            aria-label={`${title} 왼쪽으로 이동`}
            onClick={() => scrollByAmount(-280)}
            className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label={`${title} 오른쪽으로 이동`}
            onClick={() => scrollByAmount(280)}
            className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={rowRef}
        className="no-scrollbar flex flex-nowrap items-center gap-2 overflow-x-auto pb-1"
      >
        {children.length === 0 ? <p className="text-sm text-gray-400">{emptyText}</p> : children}
      </div>
    </section>
  );
}
