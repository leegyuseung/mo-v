"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type PostDetailCommentPlaceholderProps = {
  message: string;
};

/**
 * 상세 화면 공통 댓글 placeholder.
 * 왜: 공지사항/커뮤니티처럼 댓글 기능이 아직 비활성화된 화면도 동일한 배치를 재사용할 수 있다.
 */
export default function PostDetailCommentPlaceholder({
  message,
}: PostDetailCommentPlaceholderProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="mt-8 rounded-[28px] bg-gray-50 px-6 py-7">
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-gray-900">댓글 0</span>
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-200 hover:text-gray-700"
          aria-label={isOpen ? "댓글 숨기기" : "댓글 펼치기"}
        >
          {isOpen ? (
            <ChevronUp className="h-5 w-5" />
          ) : (
            <ChevronDown className="h-5 w-5" />
          )}
        </button>
      </div>

      {isOpen ? (
        <div className="mt-8 flex items-center">
          <div className="flex min-h-14 flex-1 items-center rounded-[24px] border border-dashed border-gray-200 bg-white px-4 py-3 text-[11px] text-gray-500 shadow-sm md:text-xs">
            {message}
          </div>
        </div>
      ) : null}
    </section>
  );
}
