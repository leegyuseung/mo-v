"use client";

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { PostWriteSettingsBarProps } from "@/types/post-write-settings-bar";

export default function PostWriteSettingsBar({
  categoryId = "post-category",
  categoryLabel = "카테고리",
  categoryValue,
  categoryOptions,
  onCategoryChange,
  isPinned,
  onPinnedChange,
  pinTitle = "상단 고정",
  pinDescription = "목록 상단에 먼저 노출합니다.",
  draftButtonLabel = "임시저장글",
  onClickDraftButton,
  onPrefetchDraftButton,
  draftButtonDisabled = false,
}: PostWriteSettingsBarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-gray-200 px-3 py-3 md:flex-row md:items-end md:justify-between">
      <div className="grid gap-4 md:grid-cols-[minmax(180px,220px)_1fr] md:items-end">
        <div className="space-y-2">
          <Label htmlFor={categoryId}>{categoryLabel}</Label>
          <select
            id={categoryId}
            value={categoryValue}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="flex h-10 w-full cursor-pointer rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 shadow-xs outline-none transition-colors focus:border-gray-400"
          >
            {categoryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-start gap-3 md:pb-2">
          <Checkbox
            checked={isPinned}
            onCheckedChange={(checked) => onPinnedChange(checked === true)}
          />
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-900">{pinTitle}</p>
            <p className="text-xs text-gray-500">{pinDescription}</p>
          </div>
        </label>
      </div>

      {onClickDraftButton ? (
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={onClickDraftButton}
          onMouseEnter={onPrefetchDraftButton}
          onFocus={onPrefetchDraftButton}
          disabled={draftButtonDisabled}
        >
          <FileText className="h-4 w-4" />
          <span>{draftButtonLabel}</span>
        </Button>
      ) : null}
    </div>
  );
}
