"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LIVE_BOX_REQUEST_MODAL_TEXT } from "@/lib/constant";
import { useCreateLiveBoxRequest } from "@/hooks/mutations/live-box/use-create-live-box-request";
import { useAuthStore } from "@/store/useAuthStore";

type LiveBoxRequestModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmitted?: () => void | Promise<void>;
};

export default function LiveBoxRequestModal({
  open,
  onClose,
  onSubmitted,
}: LiveBoxRequestModalProps) {
  const { user } = useAuthStore();
  const { mutateAsync: createRequest, isPending: isSubmitting } = useCreateLiveBoxRequest();
  const [topic, setTopic] = useState("");
  const [relatedSite, setRelatedSite] = useState("");
  const [topicError, setTopicError] = useState("");
  const [relatedSiteError, setRelatedSiteError] = useState("");

  if (!open) return null;

  const closeModal = () => {
    setTopic("");
    setRelatedSite("");
    setTopicError("");
    setRelatedSiteError("");
    onClose();
  };

  const handleSubmit = async () => {
    const trimmedTopic = topic.trim();
    const trimmedRelatedSite = relatedSite.trim();

    if (!trimmedTopic) {
      setTopicError(LIVE_BOX_REQUEST_MODAL_TEXT.topicRequired);
      return;
    }

    if (!trimmedRelatedSite) {
      setRelatedSiteError(LIVE_BOX_REQUEST_MODAL_TEXT.relatedSiteRequired);
      return;
    }

    if (!user) {
      toast.error("로그인 후 요청할 수 있습니다.");
      return;
    }

    try {
      await createRequest({
        requesterId: user.id,
        topic: trimmedTopic,
        relatedSite: trimmedRelatedSite,
      });
      await onSubmitted?.();
      toast.success(LIVE_BOX_REQUEST_MODAL_TEXT.submitSuccess);
      closeModal();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : LIVE_BOX_REQUEST_MODAL_TEXT.relatedSiteInvalid;
      toast.error(message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">{LIVE_BOX_REQUEST_MODAL_TEXT.title}</h2>
        <p className="mt-1 text-sm text-gray-500">{LIVE_BOX_REQUEST_MODAL_TEXT.description}</p>

        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-2 text-sm text-gray-600">주제</p>
            <Input
              value={topic}
              onChange={(event) => {
                setTopic(event.target.value);
                if (event.target.value.trim()) {
                  setTopicError("");
                }
              }}
              placeholder="예: 예시서버"
              className={`h-10 bg-white ${topicError ? "border-red-400 focus-visible:ring-red-200" : "border-gray-200"
                }`}
            />
            {topicError ? <p className="mt-1 text-xs text-red-500">{topicError}</p> : null}
          </div>

          <div>
            <p className="mb-2 text-sm text-gray-600">관련 사이트</p>
            <Input
              value={relatedSite}
              onChange={(event) => {
                setRelatedSite(event.target.value);
                if (event.target.value.trim()) {
                  setRelatedSiteError("");
                }
              }}
              placeholder="https://example.com"
              className={`h-10 bg-white ${relatedSiteError
                  ? "border-red-400 focus-visible:ring-red-200"
                  : "border-gray-200"
                }`}
            />
            {relatedSiteError ? (
              <p className="mt-1 text-xs text-red-500">{relatedSiteError}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={closeModal} className="cursor-pointer">
            {LIVE_BOX_REQUEST_MODAL_TEXT.cancelButton}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="cursor-pointer bg-gray-800 text-white hover:bg-gray-900"
          >
            {isSubmitting ? "처리중..." : LIVE_BOX_REQUEST_MODAL_TEXT.submitButton}
          </Button>
        </div>
      </div>
    </div>
  );
}
