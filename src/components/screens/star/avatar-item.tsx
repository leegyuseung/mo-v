"use client";

import type { AvatarItemProps } from "@/types/star";

/** 아바타 아이템: 프로필 이미지 + 이름 + 편집 버튼을 표시한다 */
export default function AvatarItem({
  children,
  title,
  isEditMode = false,
  isMarked = false,
  onToggleMarked,
}: AvatarItemProps) {
  return (
    <div className="w-16 shrink-0 pt-1">
      <div className="relative flex justify-center overflow-visible">
        {children}
        {isEditMode ? (
          <button
            type="button"
            aria-label="삭제 선택"
            onClick={onToggleMarked}
            className={`absolute -right-1 top-0 z-20 inline-flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border text-xs font-bold ${isMarked
              ? "border-red-600 bg-red-600 text-white"
              : "border-gray-300 bg-white text-gray-600"
              }`}
          >
            ×
          </button>
        ) : null}
      </div>
      <span className="mt-1 block h-4 w-full truncate px-0.5 text-center text-[11px] font-medium text-gray-700">
        {title}
      </span>
    </div>
  );
}
