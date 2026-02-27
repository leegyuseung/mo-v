"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { uploadContentImage } from "@/api/admin-contents";
import { useCreateContent } from "@/hooks/mutations/admin/use-create-content";
import { useAuthStore } from "@/store/useAuthStore";
import type { ContentCreateInput } from "@/types/content";
import {
  CONTENT_TYPE_OPTIONS,
  CONTENT_TYPE_OPTIONS2,
  type ContentType,
} from "@/types/content";

const PARTICIPANT_OPTIONS = ["버츄얼만", "버츄얼포함"] as const;

type ContentsWriteContactFormValues = {
  contactEmail: string;
};

/** 콘텐츠 작성 폼 화면 */
export default function ContentsWriteScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { mutateAsync: createContent, isPending: isSubmitting } = useCreateContent();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterFilePreview, setPosterFilePreview] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [applicationUrl, setApplicationUrl] = useState("");
  const [applicationUrlError, setApplicationUrlError] = useState("");
  const [contentTypes, setContentTypes] = useState<ContentType[]>([]);
  const [participantComposition, setParticipantComposition] =
    useState<(typeof PARTICIPANT_OPTIONS)[number]>("버츄얼만");
  const [hostName, setHostName] = useState("");
  const [hostOrganization, setHostOrganization] = useState("");
  const [reward, setReward] = useState("");

  const [recruitmentStart, setRecruitmentStart] = useState("");
  const [recruitmentEnd, setRecruitmentEnd] = useState("");
  const [recruitmentScheduleError, setRecruitmentScheduleError] = useState("");
  const [contentStart, setContentStart] = useState("");
  const [contentEnd, setContentEnd] = useState("");
  const [contentScheduleError, setContentScheduleError] = useState("");

  const [minParticipants, setMinParticipants] = useState("0");
  const [maxParticipants, setMaxParticipants] = useState("10");

  const [participationRequirement, setParticipationRequirement] = useState("");
  const [description, setDescription] = useState("");
  const [discord, setDiscord] = useState("");
  const [otherContact, setOtherContact] = useState("");
  const {
    register,
    watch,
    formState: { errors: formErrors },
  } = useForm<ContentsWriteContactFormValues>({
    mode: "onBlur",
    defaultValues: {
      contactEmail: "",
    },
  });
  const email = watch("contactEmail");

  const renderValidationMessage = (message?: string) => (
    <p className={`min-h-4 text-xs ${message ? "text-red-500" : "text-transparent"}`}>
      {message || "\u00a0"}
    </p>
  );

  useEffect(() => {
    return () => {
      if (posterFilePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(posterFilePreview);
      }
    };
  }, [posterFilePreview]);

  const onToggleType = (nextType: ContentType) => {
    setContentTypes((prev) =>
      prev.includes(nextType)
        ? prev.filter((type) => type !== nextType)
        : [...prev, nextType]
    );
  };

  const normalizeParticipantCount = (raw: string, fallback: string) => {
    if (!raw) return fallback;
    const onlyDigits = raw.replace(/[^\d]/g, "");
    if (!onlyDigits) return fallback;
    const value = Math.min(1000, Math.max(0, Number.parseInt(onlyDigits, 10)));
    return String(value);
  };

  const isValidHttpUrl = (value: string) => {
    try {
      const parsed = new URL(value);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const getApplicationUrlErrorMessage = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return "신청링크를 입력해 주세요.";
    if (!isValidHttpUrl(trimmed)) {
      return "신청링크는 http:// 또는 https:// 형식으로 입력해 주세요.";
    }
    return "";
  };

  const getScheduleErrorMessage = (
    start: string,
    end: string,
    label: "콘텐츠 모집 일정" | "콘텐츠 일정"
  ) => {
    if (!start || !end) return `${label}의 시작일과 종료일을 입력해 주세요.`;
    if (start > end) return `${label} 시작일은 종료일보다 늦을 수 없습니다.`;
    return "";
  };

  const handleSubmit = async () => {
    if (isSubmitting || isUploadingImage) {
      return;
    }

    if (!user) {
      toast.error("로그인 후 등록할 수 있습니다.");
      return;
    }

    const trimmedTitle = title.trim();
    const trimmedApplicationUrl = applicationUrl.trim();

    // 제출 시에는 검증 순서를 강제한다: 제목 -> 신청링크 -> 일정
    setTitleError("");
    setApplicationUrlError("");
    setRecruitmentScheduleError("");
    setContentScheduleError("");

    if (!trimmedTitle) {
      const message = "제목을 입력해 주세요.";
      setTitleError(message);
      toast.error(message);
      return;
    }

    const urlErrorMessage = getApplicationUrlErrorMessage(trimmedApplicationUrl);
    if (urlErrorMessage) {
      setApplicationUrlError(urlErrorMessage);
      toast.error(urlErrorMessage);
      return;
    }

    const nextRecruitmentScheduleError = getScheduleErrorMessage(
      recruitmentStart,
      recruitmentEnd,
      "콘텐츠 모집 일정"
    );
    if (nextRecruitmentScheduleError) {
      setRecruitmentScheduleError(nextRecruitmentScheduleError);
      toast.error(nextRecruitmentScheduleError);
      return;
    }

    const nextContentScheduleError = getScheduleErrorMessage(
      contentStart,
      contentEnd,
      "콘텐츠 일정"
    );
    if (nextContentScheduleError) {
      setContentScheduleError(nextContentScheduleError);
      toast.error(nextContentScheduleError);
      return;
    }

    const minValue = Number.parseInt(minParticipants, 10);
    const maxValue = Number.parseInt(maxParticipants, 10);
    if (Number.isNaN(minValue) || Number.isNaN(maxValue)) {
      toast.error("모집인원을 확인해 주세요.");
      return;
    }

    if (minValue > maxValue) {
      toast.error("최소모집인원은 최대모집인원보다 클 수 없습니다.");
      return;
    }

    setIsUploadingImage(true);

    try {
      let uploadedImageUrl: string | null = null;

      if (posterFile) {
        try {
          uploadedImageUrl = await uploadContentImage(posterFile, user.id);
        } catch {
          toast.error("이미지 업로드에 실패했습니다. 잠시 후 다시 시도해 주세요.");
          return;
        }
      }

      const payload: ContentCreateInput = {
        title: trimmedTitle,
        image_url: uploadedImageUrl,
        application_url: trimmedApplicationUrl,
        content_type: contentTypes,
        participant_composition: participantComposition,
        status: "pending",
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
        contact_email: email.trim() || null,
        contact_discord: discord.trim() || null,
        contact_other: otherContact.trim() || null,
      };

      try {
        await createContent(payload);
        router.push("/contents");
      } catch {
        // 에러 메시지는 useCreateContent의 onError toast에서 처리한다.
      }
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          await handleSubmit();
        }}
      >
        <fieldset
          disabled={isSubmitting || isUploadingImage}
          className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]"
        >
          <div className="space-y-4 rounded-xl border border-gray-100 bg-white p-5">
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
            {renderValidationMessage(titleError)}
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
              className={
                applicationUrlError ? "border-red-400 focus-visible:ring-red-200" : undefined
              }
            />
            {renderValidationMessage(applicationUrlError)}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-800">콘텐츠 종류 (다중선택)</p>
            <div className="flex flex-wrap gap-1.5">
              {CONTENT_TYPE_OPTIONS.map((type) => (
                <button
                  key={`content-type-${type}`}
                  type="button"
                  onClick={() => onToggleType(type)}
                  className={`h-7 cursor-pointer rounded-full border px-2 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${contentTypes.includes(type)
                      ? "border-gray-900 bg-gray-900 text-white shadow-sm"
                      : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  {type}
                </button>
              ))}
              {CONTENT_TYPE_OPTIONS2.map((type) => (
                <button
                  key={`content-type-${type}`}
                  type="button"
                  onClick={() => onToggleType(type)}
                  className={`h-7 cursor-pointer rounded-full border px-2 text-[11px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${contentTypes.includes(type)
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
              onChange={(event) =>
                setParticipantComposition(
                  event.target.value as (typeof PARTICIPANT_OPTIONS)[number]
                )
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-800">주최자</p>
              <Input
                value={hostName}
                onChange={(event) => setHostName(event.target.value)}
                placeholder="주최자"
              />
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
              <Input
                value={reward}
                onChange={(event) => setReward(event.target.value)}
                placeholder="상금 또는 상품"
              />
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
                  className={
                    recruitmentScheduleError
                      ? "border-red-400 focus-visible:ring-red-200"
                      : undefined
                  }
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
                  className={
                    recruitmentScheduleError
                      ? "border-red-400 focus-visible:ring-red-200"
                      : undefined
                  }
                />
              </div>
              {renderValidationMessage(recruitmentScheduleError)}
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
                  className={
                    contentScheduleError ? "border-red-400 focus-visible:ring-red-200" : undefined
                  }
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
                  className={
                    contentScheduleError ? "border-red-400 focus-visible:ring-red-200" : undefined
                  }
                />
              </div>
              {renderValidationMessage(contentScheduleError)}
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
                onChange={(event) =>
                  setMinParticipants(normalizeParticipantCount(event.target.value, "0"))
                }
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
                onChange={(event) =>
                  setMaxParticipants(normalizeParticipantCount(event.target.value, "10"))
                }
                placeholder="최대모집인원"
              />
            </div>
          </div>

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
                className={
                  formErrors.contactEmail ? "border-red-400 focus-visible:ring-red-200" : undefined
                }
              />
              {renderValidationMessage(formErrors.contactEmail?.message)}
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-gray-800">디스코드</p>
              <Input
                value={discord}
                onChange={(event) => setDiscord(event.target.value)}
                placeholder="디스코드 ID"
              />
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
          </div>

          <aside className="self-start rounded-xl border border-gray-100 bg-white p-4">
          <p className="mb-2 text-sm font-medium text-gray-800">이미지 추가</p>
          <input
            id="content-poster-file"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (posterFilePreview?.startsWith("blob:")) {
                URL.revokeObjectURL(posterFilePreview);
              }
              if (!file) {
                setPosterFile(null);
                setPosterFilePreview(null);
                return;
              }
              setPosterFile(file);
              setPosterFilePreview(URL.createObjectURL(file));
            }}
          />

          <label
            htmlFor="content-poster-file"
            className={`relative block h-56 overflow-hidden rounded-md border border-gray-200 bg-gray-50 ${isSubmitting || isUploadingImage ? "cursor-not-allowed opacity-70" : "cursor-pointer"
              }`}
          >
            {posterFilePreview ? (
              <Image
                src={posterFilePreview}
                alt="포스터 미리보기"
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 320px"
                className="object-contain"
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
              onClick={() => router.push("/contents")}
              disabled={isSubmitting || isUploadingImage}
              className="w-full cursor-pointer bg-red-500 text-white hover:bg-red-600"
            >
              취소하기
            </Button>
          </div>
          </aside>
        </fieldset>
      </form>
    </div>
  );
}
