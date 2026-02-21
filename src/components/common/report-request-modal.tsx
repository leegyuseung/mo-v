"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type ReportRequestModalTexts = {
  title: string;
  description: string;
  contentRequired: string;
  submitButton: string;
  cancelButton: string;
};

export default function ReportRequestModal({
  open,
  texts,
  isSubmitting,
  onSubmit,
  onClose,
}: {
  open: boolean;
  texts: ReportRequestModalTexts;
  isSubmitting: boolean;
  onSubmit: (content: string) => Promise<void>;
  onClose: () => void;
}) {
  const [content, setContent] = useState("");

  if (!open) return null;

  const handleClose = () => {
    setContent("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error(texts.contentRequired);
      return;
    }
    await onSubmit(content);
    setContent("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">{texts.title}</h2>
        <p className="mt-1 text-sm text-gray-500">{texts.description}</p>

        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="신고 내용을 입력해 주세요."
          className="mt-4 h-32 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
        />

        <div className="mt-5 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            {texts.cancelButton}
          </Button>
          <Button
            type="button"
            className="cursor-pointer bg-red-600 text-white hover:bg-red-700"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "처리중..." : texts.submitButton}
          </Button>
        </div>
      </div>
    </div>
  );
}
