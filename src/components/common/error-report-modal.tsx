"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ADMIN_ERROR_REPORT_REWARD_POINT } from "@/lib/constant";
import { toast } from "sonner";

type ErrorReportModalProps = {
  open: boolean;
  isSubmitting: boolean;
  onSubmit: (params: { title: string; detail: string }) => Promise<void>;
  onClose: () => void;
};

export default function ErrorReportModal({
  open,
  isSubmitting,
  onSubmit,
  onClose,
}: ErrorReportModalProps) {
  const [title, setTitle] = useState("");
  const [detail, setDetail] = useState("");

  if (!open) return null;

  const handleClose = () => {
    setTitle("");
    setDetail("");
    onClose();
  };

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    const trimmedDetail = detail.trim();

    if (!trimmedTitle) {
      toast.error("오류 제목을 입력해 주세요.");
      return;
    }
    if (!trimmedDetail) {
      toast.error("오류 상세 내용을 입력해 주세요.");
      return;
    }

    await onSubmit({
      title: trimmedTitle,
      detail: trimmedDetail,
    });

    setTitle("");
    setDetail("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold text-gray-900">오류 신고</h2>
        <p className="mt-1 text-sm text-gray-500">
          <span className="block">발견한 오류를 입력해 주세요.</span>
          <span className="block">
            확인 후 해결 완료 시 {ADMIN_ERROR_REPORT_REWARD_POINT}포인트를 지급합니다.
          </span>
        </p>

        <div className="mt-4 space-y-3">
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="오류 제목"
            maxLength={120}
            disabled={isSubmitting}
          />
          <textarea
            value={detail}
            onChange={(event) => setDetail(event.target.value)}
            placeholder="오류 상세 내용"
            maxLength={4000}
            className="h-36 w-full resize-none rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
            disabled={isSubmitting}
          />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button
            type="button"
            className="cursor-pointer bg-gray-900 text-white hover:bg-black"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "접수중..." : "신고 접수"}
          </Button>
        </div>
      </div>
    </div>
  );
}
