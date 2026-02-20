"use client";

import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

type ConfirmAlertProps = {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isPending?: boolean;
  confirmVariant?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmAlert({
  open,
  title,
  description,
  confirmText = "삭제",
  cancelText = "취소",
  isPending = false,
  confirmVariant = "danger",
  onConfirm,
  onCancel,
}: ConfirmAlertProps) {
  if (!open || typeof window === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl border border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-500">{description}</p>

        <div className="mt-5 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="cursor-pointer"
            disabled={isPending}
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            className={`cursor-pointer text-white ${
              confirmVariant === "default"
                ? "bg-gray-800 hover:bg-gray-900"
                : "bg-red-600 hover:bg-red-700"
            }`}
            disabled={isPending}
          >
            {isPending ? "처리중..." : confirmText}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
