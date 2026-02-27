"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { uploadContentImage, validateContentImageFile } from "@/api/admin-contents";
import { useCreateContent } from "@/hooks/mutations/admin/use-create-content";
import { useAuthStore } from "@/store/useAuthStore";
import type { ContentCreateInput, ParticipantComposition, ContentType } from "@/types/content";
import type { ContentsWriteContactFormValues } from "@/types/contents-write";

export function useContentsWriteForm() {
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
    useState<ParticipantComposition>("버츄얼만");
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

  const onSelectPosterFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (posterFilePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(posterFilePreview);
    }
    if (!file) {
      setPosterFile(null);
      setPosterFilePreview(null);
      return;
    }

    try {
      validateContentImageFile(file);
    } catch (error) {
      const message = error instanceof Error ? error.message : "이미지 파일 검증에 실패했습니다.";
      toast.error(message);
      setPosterFile(null);
      setPosterFilePreview(null);
      event.currentTarget.value = "";
      return;
    }

    setPosterFile(file);
    setPosterFilePreview(URL.createObjectURL(file));
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

    // 제출 시 검증 순서를 고정해 사용자 피드백을 단계적으로 제공한다.
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
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "이미지 업로드에 실패했습니다. 잠시 후 다시 시도해 주세요.";
          toast.error(message);
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

  return {
    isSubmitting,
    isUploadingImage,
    posterFilePreview,
    onSelectPosterFile,
    onClickCancel: () => router.push("/contents"),
    onToggleType,
    normalizeParticipantCount,
    getApplicationUrlErrorMessage,
    handleSubmit,
    register,
    formErrors,
    title,
    setTitle,
    titleError,
    setTitleError,
    applicationUrl,
    setApplicationUrl,
    applicationUrlError,
    setApplicationUrlError,
    contentTypes,
    participantComposition,
    setParticipantComposition,
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
    participationRequirement,
    setParticipationRequirement,
    description,
    setDescription,
    discord,
    setDiscord,
    otherContact,
    setOtherContact,
  };
}
