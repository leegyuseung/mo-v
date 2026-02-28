"use client";

import { Button } from "@/components/ui/button";
import type { ContentsWriteImagePanelProps } from "@/types/contents-write-components";

export default function ContentsWriteImagePanel({
  isSubmitting,
  isUploadingImage,
  posterFilePreview,
  onSelectPosterFile,
  onClickCancel,
}: ContentsWriteImagePanelProps) {
  return (
    <aside className="self-start rounded-xl border border-gray-100 bg-white p-4">
      <p className="mb-2 text-sm font-medium text-gray-800">이미지 추가</p>
      <input
        id="content-poster-file"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onSelectPosterFile}
      />

      <label
        htmlFor="content-poster-file"
        className={`relative block h-56 overflow-hidden rounded-md border border-gray-200 bg-gray-50 ${
          isSubmitting || isUploadingImage ? "cursor-not-allowed opacity-70" : "cursor-pointer"
        }`}
      >
        {posterFilePreview ? (
          <img
            src={posterFilePreview}
            alt="포스터 미리보기"
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-400">
            클릭해서 포스터 이미지 선택
          </div>
        )}
      </label>

      <div className="mt-3 space-y-2">
        <Button
          type="submit"
          disabled={isSubmitting || isUploadingImage}
          className="w-full cursor-pointer bg-gray-800 text-white hover:bg-gray-900"
        >
          {isUploadingImage || isSubmitting ? "등록중..." : "등록하기"}
        </Button>
        <Button
          type="button"
          onClick={onClickCancel}
          disabled={isSubmitting || isUploadingImage}
          className="w-full cursor-pointer bg-red-500 text-white hover:bg-red-600"
        >
          취소하기
        </Button>
      </div>
    </aside>
  );
}
