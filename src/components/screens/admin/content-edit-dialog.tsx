"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CONTENT_TYPE_OPTIONS,
  CONTENT_TYPE_OPTIONS2,
  type ContentStatus,
  type ContentType,
  type ContentUpdateInput,
  type ContentWithAuthorProfile,
  type ParticipantComposition,
} from "@/types/content";

const STATUS_OPTIONS: ContentStatus[] = [
  "pending",
  "approved",
  "ended",
  "rejected",
  "cancelled",
  "deleted",
];
const PARTICIPANT_OPTIONS: ParticipantComposition[] = ["버츄얼만", "버츄얼포함"];

type ContentEditDialogProps = {
  open: boolean;
  content: ContentWithAuthorProfile;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (contentId: number, payload: ContentUpdateInput) => void;
};

function getStatusLabel(status: ContentStatus) {
  if (status === "pending") return "대기중";
  if (status === "approved") return "승인";
  if (status === "ended") return "마감";
  if (status === "rejected") return "거절";
  if (status === "cancelled") return "취소";
  return "삭제";
}

function isValidHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function toDateInputValue(value: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

/** 콘텐츠 수정 다이얼로그 */
export default function ContentEditDialog({
  open,
  content,
  isPending,
  onOpenChange,
  onSubmit,
}: ContentEditDialogProps) {
  const [title, setTitle] = useState(content.title);
  const [imageUrl, setImageUrl] = useState(content.image_url || "");
  const [applicationUrl, setApplicationUrl] = useState(content.application_url);
  const [contentTypes, setContentTypes] = useState<ContentType[]>(
    (content.content_type || []) as ContentType[]
  );
  const [participantComposition, setParticipantComposition] =
    useState<ParticipantComposition>(content.participant_composition);
  const [hostName, setHostName] = useState(content.host_name || "");
  const [hostOrganization, setHostOrganization] = useState(content.host_organization || "");
  const [reward, setReward] = useState(content.reward || "");
  const [recruitmentStart, setRecruitmentStart] = useState(
    toDateInputValue(content.recruitment_start_at)
  );
  const [recruitmentEnd, setRecruitmentEnd] = useState(toDateInputValue(content.recruitment_end_at));
  const [contentStart, setContentStart] = useState(toDateInputValue(content.content_start_at));
  const [contentEnd, setContentEnd] = useState(toDateInputValue(content.content_end_at));
  const [minParticipants, setMinParticipants] = useState(
    content.min_participants === null ? "" : String(content.min_participants)
  );
  const [maxParticipants, setMaxParticipants] = useState(
    content.max_participants === null ? "" : String(content.max_participants)
  );
  const [participationRequirement, setParticipationRequirement] = useState(
    content.participation_requirement || ""
  );
  const [description, setDescription] = useState(content.description || "");
  const [contactEmail, setContactEmail] = useState(content.contact_email || "");
  const [contactDiscord, setContactDiscord] = useState(content.contact_discord || "");
  const [contactOther, setContactOther] = useState(content.contact_other || "");
  const [status, setStatus] = useState<ContentStatus>(content.status as ContentStatus);
  const [reviewNote, setReviewNote] = useState(content.review_note || "");

  const onToggleType = (nextType: ContentType) => {
    setContentTypes((prev) =>
      prev.includes(nextType)
        ? prev.filter((type) => type !== nextType)
        : [...prev, nextType]
    );
  };

  const normalizeParticipantCount = (raw: string) => {
    if (!raw) return "";
    const onlyDigits = raw.replace(/[^\d]/g, "");
    if (!onlyDigits) return "";
    const value = Math.min(1000, Math.max(0, Number.parseInt(onlyDigits, 10)));
    return String(value);
  };

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    const trimmedApplicationUrl = applicationUrl.trim();
    const trimmedImageUrl = imageUrl.trim();

    if (!trimmedTitle) {
      toast.error("제목을 입력해 주세요.");
      return;
    }

    if (!trimmedApplicationUrl || !isValidHttpUrl(trimmedApplicationUrl)) {
      toast.error("신청링크는 http:// 또는 https:// 형식이어야 합니다.");
      return;
    }

    if (trimmedImageUrl && !isValidHttpUrl(trimmedImageUrl)) {
      toast.error("이미지 URL은 http:// 또는 https:// 형식이어야 합니다.");
      return;
    }

    if ((recruitmentStart && !recruitmentEnd) || (!recruitmentStart && recruitmentEnd)) {
      toast.error("콘텐츠 모집 일정은 시작일과 종료일을 함께 입력해 주세요.");
      return;
    }
    if (recruitmentStart && recruitmentEnd && recruitmentStart > recruitmentEnd) {
      toast.error("콘텐츠 모집 일정 시작일은 종료일보다 늦을 수 없습니다.");
      return;
    }

    if ((contentStart && !contentEnd) || (!contentStart && contentEnd)) {
      toast.error("콘텐츠 일정은 시작일과 종료일을 함께 입력해 주세요.");
      return;
    }
    if (contentStart && contentEnd && contentStart > contentEnd) {
      toast.error("콘텐츠 일정 시작일은 종료일보다 늦을 수 없습니다.");
      return;
    }

    const minValue =
      minParticipants.trim() === "" ? null : Number.parseInt(minParticipants, 10);
    const maxValue =
      maxParticipants.trim() === "" ? null : Number.parseInt(maxParticipants, 10);

    if ((minValue !== null && Number.isNaN(minValue)) || (maxValue !== null && Number.isNaN(maxValue))) {
      toast.error("모집인원을 확인해 주세요.");
      return;
    }

    if (minValue !== null && maxValue !== null && minValue > maxValue) {
      toast.error("최소모집인원은 최대모집인원보다 클 수 없습니다.");
      return;
    }

    if (status === "rejected" && !reviewNote.trim()) {
      toast.error("거절 상태는 거절 사유를 입력해 주세요.");
      return;
    }

    onSubmit(content.id, {
      title: trimmedTitle,
      image_url: trimmedImageUrl || null,
      application_url: trimmedApplicationUrl,
      content_type: contentTypes,
      participant_composition: participantComposition,
      status,
      host_name: hostName.trim() || null,
      host_organization: hostOrganization.trim() || null,
      reward: reward.trim() || null,
      recruitment_start_at: recruitmentStart || null,
      recruitment_end_at: recruitmentEnd || null,
      content_start_at: contentStart || null,
      content_end_at: contentEnd || null,
      min_participants: minValue,
      max_participants: maxValue,
      participation_requirement: participationRequirement.trim() || null,
      description: description.trim() || null,
      review_note: reviewNote.trim() || null,
      contact_email: contactEmail.trim() || null,
      contact_discord: contactDiscord.trim() || null,
      contact_other: contactOther.trim() || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>콘텐츠 수정</DialogTitle>
          <DialogDescription>모든 항목을 수정할 수 있습니다.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-800">제목</p>
              <Input value={title} onChange={(event) => setTitle(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-800">이미지 URL</p>
              <Input
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-medium text-gray-800">신청링크</p>
            <Input
              value={applicationUrl}
              onChange={(event) => setApplicationUrl(event.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-800">콘텐츠 종류 (다중선택)</p>
            <div className="flex flex-wrap gap-1.5">
              {[...CONTENT_TYPE_OPTIONS, ...CONTENT_TYPE_OPTIONS2].map((type) => (
                <button
                  key={`content-edit-type-${type}`}
                  type="button"
                  onClick={() => onToggleType(type)}
                  className={`h-7 cursor-pointer rounded-full border px-2 text-[11px] font-semibold transition-colors ${contentTypes.includes(type)
                      ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-800">참가자 구성</p>
              <select
                value={participantComposition}
                onChange={(event) =>
                  setParticipantComposition(event.target.value as ParticipantComposition)
                }
                className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-gray-300"
              >
                {PARTICIPANT_OPTIONS.map((option) => (
                  <option key={`participant-option-${option}`} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-800">상태</p>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as ContentStatus)}
                className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none focus:border-gray-300"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={`status-option-${option}`} value={option}>
                    {getStatusLabel(option)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-800">거절사유</p>
              <Input
                value={reviewNote}
                onChange={(event) => setReviewNote(event.target.value)}
                placeholder="거절 상태일 때 입력"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-800">주최자</p>
              <Input value={hostName} onChange={(event) => setHostName(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-800">주최단체</p>
              <Input
                value={hostOrganization}
                onChange={(event) => setHostOrganization(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-800">상금(상품)</p>
              <Input value={reward} onChange={(event) => setReward(event.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-800">콘텐츠 모집 일정</p>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={recruitmentStart}
                  onChange={(event) => setRecruitmentStart(event.target.value)}
                />
                <span className="text-sm text-gray-500">~</span>
                <Input
                  type="date"
                  value={recruitmentEnd}
                  onChange={(event) => setRecruitmentEnd(event.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-800">콘텐츠 일정</p>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={contentStart}
                  onChange={(event) => setContentStart(event.target.value)}
                />
                <span className="text-sm text-gray-500">~</span>
                <Input
                  type="date"
                  value={contentEnd}
                  onChange={(event) => setContentEnd(event.target.value)}
                />
              </div>
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
                onChange={(event) => setMinParticipants(normalizeParticipantCount(event.target.value))}
              />
              <span className="text-sm text-gray-500">-</span>
              <Input
                type="number"
                min={0}
                max={1000}
                value={maxParticipants}
                onChange={(event) => setMaxParticipants(normalizeParticipantCount(event.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-medium text-gray-800">참가조건</p>
            <Textarea
              value={participationRequirement}
              onChange={(event) => setParticipationRequirement(event.target.value)}
              className="min-h-24"
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-medium text-gray-800">콘텐츠 설명</p>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-28"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-800">이메일</p>
              <Input
                type="email"
                value={contactEmail}
                onChange={(event) => setContactEmail(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-800">디스코드</p>
              <Input
                value={contactDiscord}
                onChange={(event) => setContactDiscord(event.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-800">기타 연락처</p>
              <Input
                value={contactOther}
                onChange={(event) => setContactOther(event.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
            disabled={isPending}
          >
            취소
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="cursor-pointer bg-gray-900 text-white hover:bg-black"
            disabled={isPending}
          >
            {isPending ? "저장중..." : "저장"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
