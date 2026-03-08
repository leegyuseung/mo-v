import { useMemo, useState } from "react";
import { useChzzkChannelProfile } from "@/hooks/queries/admin/use-chzzk-channel-profile";
import type {
  PendingStreamerRequestFormField,
  PendingStreamerRequestFormParams,
  PendingStreamerRequestFormState,
} from "@/types/admin-pending-request";

function createInitialFormState(
  request: PendingStreamerRequestFormParams["request"]
): PendingStreamerRequestFormState {
  return {
    nickname: "",
    imageUrl: "",
    chzzkId: request.platform === "chzzk" ? request.platform_streamer_id : "",
    soopId: request.platform === "soop" ? request.platform_streamer_id : "",
    groupNameInput: "",
    crewNameInput: "",
    supporters: "",
    birthday: "",
    nationality: "",
    gender: "",
    genreInput: "",
    firstStreamDate: "",
    fandomName: "",
    mbti: "",
    aliasInput: "",
    platformUrl: request.platform_streamer_url || "",
    fancafeUrl: "",
    youtubeUrl: "",
  };
}

export function usePendingStreamerRequestForm({
  request,
}: PendingStreamerRequestFormParams) {
  const [form, setForm] = useState<PendingStreamerRequestFormState>(() =>
    createInitialFormState(request)
  );
  const isChzzkRequest = request.platform === "chzzk";
  const normalizedChzzkId = form.chzzkId.trim();
  const {
    data: chzzkProfile,
    isLoading: isChzzkLoading,
    isError: isChzzkError,
  } = useChzzkChannelProfile(normalizedChzzkId, isChzzkRequest && Boolean(normalizedChzzkId));

  const setField = (key: PendingStreamerRequestFormField, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const effectiveNickname = useMemo(
    () => form.nickname.trim() || (isChzzkRequest ? chzzkProfile?.channelName || "" : ""),
    [chzzkProfile?.channelName, form.nickname, isChzzkRequest]
  );
  const effectiveImageUrl = useMemo(
    () =>
      form.imageUrl.trim() || (isChzzkRequest ? chzzkProfile?.channelImageUrl || "" : ""),
    [chzzkProfile?.channelImageUrl, form.imageUrl, isChzzkRequest]
  );

  return {
    form,
    setField,
    effectiveNickname,
    effectiveImageUrl,
    isChzzkRequest,
    isChzzkLoading,
    isChzzkError,
  };
}
