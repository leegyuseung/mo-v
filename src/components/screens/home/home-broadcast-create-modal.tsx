"use client";

import type { HomeBroadcastCreateModalProps } from "@/types/home-broadcast-board";

export default function HomeBroadcastCreateModal({
  isOpen,
  isCreating,
  isPointInsufficient,
  currentPoint,
  costPoint,
  contentInput,
  onContentInputChange,
  onClose,
  onSubmit,
}: HomeBroadcastCreateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">확성기 등록</h2>
        <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
          <p className="text-sm text-gray-700">
            작성 시
            <span className="mx-1 inline-flex rounded-md bg-red-100 px-2 py-0.5 text-xs font-extrabold text-red-600">
              {costPoint}하트
            </span>
            가 사용되고 6시간 후 삭제됩니다.
          </p>
          <p
            className={`mt-1 text-sm font-semibold ${
              isPointInsufficient ? "text-red-600" : "text-gray-900"
            }`}
          >
            현재 보유 하트: {currentPoint.toLocaleString()}P
            {isPointInsufficient ? " (포인트 부족으로 사용 불가)" : ""}
          </p>
        </div>
        <p className="mt-2 text-sm text-gray-500">
          욕설/비속어/비방 등 부적절한 내용 작성 시 회원 정지 대상입니다.
        </p>
        <textarea
          value={contentInput}
          onChange={(event) => onContentInputChange(event.target.value)}
          placeholder="전광판 내용을 입력해 주세요."
          maxLength={300}
          disabled={isCreating}
          className="mt-4 h-32 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
        />
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isCreating}
            className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-gray-200 px-4 text-sm text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isCreating || isPointInsufficient}
            className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md bg-gray-900 px-4 text-sm font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCreating ? "등록중..." : "확인"}
          </button>
        </div>
      </div>
    </div>
  );
}

