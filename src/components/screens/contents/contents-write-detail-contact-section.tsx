"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { ContentsWriteDetailContactSectionProps } from "@/types/contents-write-components";
import ContentsWriteValidationMessage from "@/components/screens/contents/contents-write-validation-message";

export default function ContentsWriteDetailContactSection({
  participationRequirement,
  setParticipationRequirement,
  description,
  setDescription,
  register,
  formErrors,
  discord,
  setDiscord,
  otherContact,
  setOtherContact,
}: ContentsWriteDetailContactSectionProps) {
  return (
    <>
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-800">참가조건</p>
        <Textarea
          value={participationRequirement}
          onChange={(event) => setParticipationRequirement(event.target.value)}
          placeholder="참가조건"
          className="min-h-24"
        />
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-gray-800">콘텐츠설명</p>
        <Textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="콘텐츠 설명"
          className="min-h-28"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-gray-800">이메일</p>
          <Input
            type="email"
            {...register("contactEmail")}
            placeholder="이메일 주소"
            className={formErrors.contactEmail ? "border-red-400 focus-visible:ring-red-200" : undefined}
          />
          <ContentsWriteValidationMessage message={formErrors.contactEmail?.message} />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-gray-800">디스코드</p>
          <Input value={discord} onChange={(event) => setDiscord(event.target.value)} placeholder="디스코드 ID" />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-gray-800">기타</p>
          <Input
            value={otherContact}
            onChange={(event) => setOtherContact(event.target.value)}
            placeholder="Kakao ID, 연락처 등"
          />
        </div>
      </div>
    </>
  );
}
