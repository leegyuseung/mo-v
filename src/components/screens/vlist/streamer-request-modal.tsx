"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCreateStreamerRequest } from "@/hooks/mutations/streamers/use-create-streamer-request";
import { useAuthStore } from "@/store/useAuthStore";
import type { StreamerRequestPlatform } from "@/types/streamer";
import { toast } from "sonner";
import { STREAMER_REQUEST_MODAL_TEXT } from "@/lib/constant";

type StreamerRequestModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function StreamerRequestModal({
  open,
  onClose,
}: StreamerRequestModalProps) {
  const [requestPlatform, setRequestPlatform] =
    useState<StreamerRequestPlatform>("chzzk");
  const [requestUrl, setRequestUrl] = useState("");
  const [requestUrlError, setRequestUrlError] = useState("");
  const { user } = useAuthStore();
  const { mutateAsync: createRequest, isPending: isRequestSubmitting } =
    useCreateStreamerRequest();

  if (!open) {
    return null;
  }

  const closeModal = () => {
    setRequestUrl("");
    setRequestUrlError("");
    setRequestPlatform("chzzk");
    onClose();
  };

  const extractPlatformIdFromUrl = (
    platformValue: StreamerRequestPlatform,
    rawUrl: string
  ): string | null => {
    const trimmed = rawUrl.trim();
    if (!trimmed) return null;

    const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

    try {
      const url = new URL(candidate);
      const host = url.hostname.toLowerCase();
      const segments = url.pathname.split("/").filter(Boolean);

      if (platformValue === "chzzk") {
        if (!host.endsWith("chzzk.naver.com") || segments.length < 1) return null;

        // 채널 ID 포맷(32자리 hex)이 있으면 우선 사용
        const idByPattern = segments.find((segment) =>
          /^[a-f0-9]{32}$/i.test(segment)
        );
        if (idByPattern) {
          return idByPattern;
        }

        // /{channelId}, /live/{channelId} 등 변형 대비: 마지막 세그먼트 사용
        return segments[segments.length - 1] || null;
      }

      if (
        (host !== "www.sooplive.co.kr" && host !== "sooplive.co.kr") ||
        segments.length < 2 ||
        segments[0] !== "station"
      ) {
        return null;
      }
      return segments[1] || null;
    } catch {
      return null;
    }
  };

  const buildCanonicalStreamerUrl = (
    platformValue: StreamerRequestPlatform,
    streamerId: string
  ) => {
    if (platformValue === "chzzk") {
      return `https://chzzk.naver.com/${streamerId}`;
    }
    return `https://www.sooplive.co.kr/station/${streamerId}`;
  };

  const handleSubmitRequest = async () => {
    if (!requestUrl.trim()) {
      setRequestUrlError(STREAMER_REQUEST_MODAL_TEXT.urlRequired);
      return;
    }

    const extractedId = extractPlatformIdFromUrl(requestPlatform, requestUrl);
    if (!extractedId) {
      setRequestUrlError(STREAMER_REQUEST_MODAL_TEXT.urlInvalid);
      return;
    }

    if (!user) {
      toast.error("로그인 후 요청할 수 있습니다.");
      return;
    }

    try {
      const normalizedUrl = buildCanonicalStreamerUrl(requestPlatform, extractedId);

      await createRequest({
        requesterId: user.id,
        platform: requestPlatform,
        platformStreamerId: extractedId,
        platformStreamerUrl: normalizedUrl,
      });
      toast.success(STREAMER_REQUEST_MODAL_TEXT.submitSuccess);
      closeModal();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : STREAMER_REQUEST_MODAL_TEXT.alreadyPending;
      toast.error(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">
          {STREAMER_REQUEST_MODAL_TEXT.title}
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          {STREAMER_REQUEST_MODAL_TEXT.description}
        </p>

        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-2 text-sm text-gray-600">플랫폼</p>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={requestPlatform === "chzzk" ? "default" : "outline"}
                onClick={() => setRequestPlatform("chzzk")}
                className={`cursor-pointer ${
                  requestPlatform === "chzzk"
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : ""
                }`}
              >
                치지직
              </Button>
              <Button
                type="button"
                size="sm"
                variant={requestPlatform === "soop" ? "default" : "outline"}
                onClick={() => setRequestPlatform("soop")}
                className={`cursor-pointer ${
                  requestPlatform === "soop"
                    ? "bg-blue-500 hover:bg-blue-600 text-white"
                    : ""
                }`}
              >
                SOOP
              </Button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm text-gray-600">
              {requestPlatform === "chzzk" ? "치지직 채널 주소" : "SOOP 방송국 주소"}
            </p>
            <Input
              value={requestUrl}
              onChange={(e) => {
                setRequestUrl(e.target.value);
                if (e.target.value.trim()) {
                  setRequestUrlError("");
                }
              }}
              placeholder={
                requestPlatform === "chzzk"
                  ? "치지직 채널 주소를 입력해 주세요"
                  : "SOOP 방송국 주소를 입력해 주세요"
              }
              className={`h-10 bg-white ${
                requestUrlError
                  ? "border-red-400 focus-visible:ring-red-200"
                  : "border-gray-200"
              }`}
            />
            {requestUrlError && (
              <p className="mt-1 text-xs text-red-500">{requestUrlError}</p>
            )}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={closeModal}
            className="cursor-pointer"
          >
            {STREAMER_REQUEST_MODAL_TEXT.cancelButton}
          </Button>
          <Button
            type="button"
            onClick={handleSubmitRequest}
            disabled={isRequestSubmitting}
            className="cursor-pointer bg-gray-800 hover:bg-gray-900 text-white"
          >
            {isRequestSubmitting ? "처리중..." : STREAMER_REQUEST_MODAL_TEXT.submitButton}
          </Button>
        </div>
      </div>
    </div>
  );
}
