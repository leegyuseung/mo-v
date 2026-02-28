"use client";

import { Eye, Heart, Image as ImageIcon, Loader, Pause, X } from "lucide-react";
import Link from "next/link";
import type { ContentStatus } from "@/types/content";
import type { ContentListItemCardProps } from "@/types/contents-screen-components";
import {
  formatDateRange,
  getRecruitmentDdayLabel,
  getStatusClassName,
  getStatusLabel,
} from "@/components/screens/contents/contents-screen-utils";

export default function ContentListItemCard({
  content,
  favoriteCount,
  isLiked,
  isFavoriteDisabled,
  canToggleFavorite,
  nowTimestamp,
  onClickToggleFavorite,
}: ContentListItemCardProps) {
  const isPending = content.status === "pending";
  const isApproved = content.status === "approved";
  const isEnded = content.status === "ended";
  const ddayLabel = isApproved
    ? getRecruitmentDdayLabel(content.recruitment_end_at, nowTimestamp)
    : null;
  const visibleContentTypes = content.content_type.slice(0, 8);
  const hiddenContentTypeCount = Math.max(0, content.content_type.length - 8);

  const cardBody = (
    <article
      className={`group rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-gray-400 hover:bg-gray-50/40 hover:shadow-[0_14px_28px_-14px_rgba(0,0,0,0.45)] md:grid md:grid-cols-[72px_minmax(220px,1.2fr)_minmax(260px,1.1fr)_minmax(240px,1fr)_auto] md:items-center md:gap-4 ${isApproved ? "cursor-pointer" : ""}`}
    >
      <div className="mb-3 flex items-start gap-3 md:mb-0 md:contents">
        <div className="shrink-0 md:mb-0">
          <div className="relative h-16 w-16 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
            {content.image_url ? (
              <img
                src={content.image_url}
                alt={`${content.title} 이미지`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">
                <ImageIcon className="h-5 w-5" />
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1 md:mb-0">
          <div className="mb-1 flex flex-wrap items-center gap-1.5">
            {content.isNew ? (
              <span className="rounded-full border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700">
                NEW
              </span>
            ) : null}
            {content.isClosingSoon ? (
              <span className="rounded-full border border-rose-200 bg-rose-50 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700">
                마감임박
              </span>
            ) : null}
            <span className="rounded-full border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-[10px] font-semibold text-gray-700">
              {content.participant_composition}
            </span>
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold md:hidden ${getStatusClassName(
                content.status
              )}`}
            >
              {isPending ? <Pause className="h-3 w-3" /> : null}
              {isApproved ? <Loader className="h-3 w-3 animate-spin" /> : null}
              {isEnded ? <X className="h-3 w-3" /> : null}
              {getStatusLabel(content.status)}
              {ddayLabel ? (
                <span className="ml-0.5 text-[10px] font-bold text-rose-600">
                  {ddayLabel}
                </span>
              ) : null}
            </span>
          </div>

          <div className="space-y-0.5 text-[11px] text-gray-500 md:hidden">
            <p>모집일정: {formatDateRange(content.recruitment_start_at, content.recruitment_end_at)}</p>
            <p>콘텐츠일정: {formatDateRange(content.content_start_at, content.content_end_at)}</p>
          </div>

          <h2 className="mt-2 hidden truncate text-base font-semibold text-gray-900 transition-colors group-hover:text-black md:block">
            {content.title}
          </h2>
        </div>
      </div>

      <h2 className="mb-3 truncate text-base font-semibold text-gray-900 transition-colors group-hover:text-black md:hidden">
        {content.title}
      </h2>

      <p className="mb-3 min-h-10 line-clamp-2 text-sm text-gray-600 md:mb-0">
        {content.description || "설명이 없습니다."}
      </p>

      <div className="mb-4 space-y-2 text-xs text-gray-500 md:mb-0">
        <div className="flex flex-wrap items-center gap-1.5">
          {content.content_type.length > 0 ? (
            <>
              {visibleContentTypes.map((type) => (
                <span
                  key={`${content.id}-${type}`}
                  className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-700"
                >
                  {type}
                </span>
              ))}
              {hiddenContentTypeCount > 0 ? (
                <span className="rounded-md border border-gray-200 bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
                  +{hiddenContentTypeCount}
                </span>
              ) : null}
            </>
          ) : (
            <span className="rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs text-gray-500">
              미지정
            </span>
          )}
        </div>
      </div>

      <div className="mb-2 flex items-center justify-end gap-2 text-xs text-gray-900 md:hidden">
        <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-gray-900">
          <Eye className="h-3.5 w-3.5" />
          {content.view_count.toLocaleString()}
        </span>
        <button
          type="button"
          onClick={(event) => onClickToggleFavorite(event, content.id, content.status as ContentStatus)}
          disabled={isFavoriteDisabled}
          className={`inline-flex items-center gap-1 rounded-full border bg-gray-50 px-2 py-0.5 transition-colors ${isLiked ? "border-red-200 text-red-600" : "border-gray-200 text-gray-500"
            } ${canToggleFavorite ? "cursor-pointer hover:border-red-300 hover:text-red-600" : ""} ${isFavoriteDisabled ? "opacity-60" : ""
            }`}
        >
          <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
          {favoriteCount.toLocaleString()}
        </button>
      </div>

      <div className="hidden items-center justify-between gap-2 md:flex md:flex-col md:items-end md:justify-center">
        <span
          className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusClassName(
            content.status
          )}`}
        >
          {isPending ? <Pause className="h-3.5 w-3.5" /> : null}
          {isApproved ? <Loader className="h-3.5 w-3.5 animate-spin" /> : null}
          {isEnded ? <X className="h-3.5 w-3.5" /> : null}
          {getStatusLabel(content.status)}
          {ddayLabel ? (
            <span className="ml-0.5 text-xs font-bold text-green-700">
              {ddayLabel}
            </span>
          ) : null}
        </span>
        <div className="space-y-0.5 text-right text-[11px] text-gray-500">
          <p>모집일정: {formatDateRange(content.recruitment_start_at, content.recruitment_end_at)}</p>
          <p>콘텐츠일정: {formatDateRange(content.content_start_at, content.content_end_at)}</p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 text-xs text-gray-900">
          <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-gray-900">
            <Eye className="h-3.5 w-3.5" />
            {content.view_count.toLocaleString()}
          </span>
          <button
            type="button"
            onClick={(event) => onClickToggleFavorite(event, content.id, content.status as ContentStatus)}
            disabled={isFavoriteDisabled}
            className={`inline-flex items-center gap-1 rounded-full border bg-gray-50 px-2 py-0.5 transition-colors ${isLiked ? "border-red-200 text-red-600" : "border-gray-200 text-gray-500"
              } ${canToggleFavorite ? "cursor-pointer hover:border-red-300 hover:text-red-600" : ""} ${isFavoriteDisabled ? "opacity-60" : ""
              }`}
          >
            <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
            {favoriteCount.toLocaleString()}
          </button>
        </div>
        {isPending ? <span className="h-7 md:hidden" /> : null}
      </div>
    </article>
  );

  if (!isApproved) {
    return cardBody;
  }

  return (
    <Link href={`/contents/${content.id}`} className="block">
      {cardBody}
    </Link>
  );
}
