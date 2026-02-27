"use client";

import { Input } from "@/components/ui/input";
import type { ContentsWriteScheduleHostSectionProps } from "@/types/contents-write-components";
import ContentsWriteValidationMessage from "@/components/screens/contents/contents-write-validation-message";

export default function ContentsWriteScheduleHostSection({
  hostName,
  setHostName,
  hostOrganization,
  setHostOrganization,
  reward,
  setReward,
  recruitmentStart,
  setRecruitmentStart,
  recruitmentEnd,
  setRecruitmentEnd,
  recruitmentScheduleError,
  setRecruitmentScheduleError,
  contentStart,
  setContentStart,
  contentEnd,
  setContentEnd,
  contentScheduleError,
  setContentScheduleError,
  minParticipants,
  setMinParticipants,
  maxParticipants,
  setMaxParticipants,
  normalizeParticipantCount,
}: ContentsWriteScheduleHostSectionProps) {
  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-gray-800">주최자</p>
          <Input value={hostName} onChange={(event) => setHostName(event.target.value)} placeholder="주최자" />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-gray-800">주최단체</p>
          <Input
            value={hostOrganization}
            onChange={(event) => setHostOrganization(event.target.value)}
            placeholder="주최단체"
          />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-gray-800">상금(상품)</p>
          <Input value={reward} onChange={(event) => setReward(event.target.value)} placeholder="상금 또는 상품" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-gray-800">
            콘텐츠 모집 일정 <span className="text-red-500">*</span>
          </p>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={recruitmentStart}
              onChange={(event) => {
                setRecruitmentStart(event.target.value);
                if (recruitmentScheduleError) {
                  setRecruitmentScheduleError("");
                }
              }}
              className={recruitmentScheduleError ? "border-red-400 focus-visible:ring-red-200" : undefined}
            />
            <span className="text-sm text-gray-500">~</span>
            <Input
              type="date"
              value={recruitmentEnd}
              onChange={(event) => {
                setRecruitmentEnd(event.target.value);
                if (recruitmentScheduleError) {
                  setRecruitmentScheduleError("");
                }
              }}
              className={recruitmentScheduleError ? "border-red-400 focus-visible:ring-red-200" : undefined}
            />
          </div>
          <ContentsWriteValidationMessage message={recruitmentScheduleError} />
        </div>

        <div className="space-y-1.5">
          <p className="text-sm font-medium text-gray-800">
            콘텐츠 일정 <span className="text-red-500">*</span>
          </p>
          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={contentStart}
              onChange={(event) => {
                setContentStart(event.target.value);
                if (contentScheduleError) {
                  setContentScheduleError("");
                }
              }}
              className={contentScheduleError ? "border-red-400 focus-visible:ring-red-200" : undefined}
            />
            <span className="text-sm text-gray-500">~</span>
            <Input
              type="date"
              value={contentEnd}
              onChange={(event) => {
                setContentEnd(event.target.value);
                if (contentScheduleError) {
                  setContentScheduleError("");
                }
              }}
              className={contentScheduleError ? "border-red-400 focus-visible:ring-red-200" : undefined}
            />
          </div>
          <ContentsWriteValidationMessage message={contentScheduleError} />
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-800">최소/최대 모집인원</p>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            max={1000}
            value={minParticipants}
            onKeyDown={(event) => {
              if (event.key === "-" || event.key.toLowerCase() === "e") {
                event.preventDefault();
              }
            }}
            onChange={(event) => setMinParticipants(normalizeParticipantCount(event.target.value, "0"))}
            placeholder="최소모집인원"
          />
          <span className="text-sm text-gray-500">-</span>
          <Input
            type="number"
            min={0}
            max={1000}
            value={maxParticipants}
            onKeyDown={(event) => {
              if (event.key === "-" || event.key.toLowerCase() === "e") {
                event.preventDefault();
              }
            }}
            onChange={(event) => setMaxParticipants(normalizeParticipantCount(event.target.value, "10"))}
            placeholder="최대모집인원"
          />
        </div>
      </div>
    </>
  );
}
