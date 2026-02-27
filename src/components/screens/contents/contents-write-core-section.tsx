"use client";

import { Input } from "@/components/ui/input";
import {
  CONTENT_TYPE_OPTIONS,
  CONTENT_TYPE_OPTIONS2,
  PARTICIPANT_COMPOSITION_OPTIONS,
  type ContentType,
  type ParticipantComposition,
} from "@/types/content";
import type { ContentsWriteCoreSectionProps } from "@/types/contents-write-components";
import ContentsWriteValidationMessage from "@/components/screens/contents/contents-write-validation-message";

export default function ContentsWriteCoreSection({
  title,
  setTitle,
  titleError,
  setTitleError,
  applicationUrl,
  setApplicationUrl,
  applicationUrlError,
  setApplicationUrlError,
  getApplicationUrlErrorMessage,
  contentTypes,
  onToggleType,
  participantComposition,
  setParticipantComposition,
}: ContentsWriteCoreSectionProps) {
  return (
    <>
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-800">
          제목 <span className="text-red-500">*</span>
        </p>
        <Input
          value={title}
          onChange={(event) => {
            const nextValue = event.target.value;
            setTitle(nextValue);
            if (nextValue.trim()) {
              setTitleError("");
            }
          }}
          onBlur={(event) => {
            if (!event.target.value.trim()) {
              setTitleError("제목을 입력해 주세요.");
            }
          }}
          placeholder="콘텐츠 제목"
          className={titleError ? "border-red-400 focus-visible:ring-red-200" : undefined}
        />
        <ContentsWriteValidationMessage message={titleError} />
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-800">
          신청링크 <span className="text-red-500">*</span>
        </p>
        <Input
          type="url"
          value={applicationUrl}
          onChange={(event) => {
            const nextValue = event.target.value;
            setApplicationUrl(nextValue);
            if (!nextValue.trim()) {
              setApplicationUrlError("");
              return;
            }
            setApplicationUrlError(getApplicationUrlErrorMessage(nextValue));
          }}
          onBlur={(event) => {
            setApplicationUrlError(getApplicationUrlErrorMessage(event.target.value));
          }}
          placeholder="https://..."
          className={applicationUrlError ? "border-red-400 focus-visible:ring-red-200" : undefined}
        />
        <ContentsWriteValidationMessage message={applicationUrlError} />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-800">콘텐츠 종류 (다중선택)</p>
        <div className="flex flex-wrap gap-1.5">
          {[...CONTENT_TYPE_OPTIONS, ...CONTENT_TYPE_OPTIONS2].map((type) => (
            <button
              key={`content-type-${type}`}
              type="button"
              onClick={() => onToggleType(type as ContentType)}
              className={`h-7 cursor-pointer rounded-full border px-2 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                contentTypes.includes(type as ContentType)
                  ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                  : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-800">
          참가자 구성 <span className="text-red-500">*</span>
        </p>
        <select
          value={participantComposition}
          onChange={(event) => setParticipantComposition(event.target.value as ParticipantComposition)}
          className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-gray-300"
        >
          {PARTICIPANT_COMPOSITION_OPTIONS.map((option) => (
            <option key={`participant-option-${option}`} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
