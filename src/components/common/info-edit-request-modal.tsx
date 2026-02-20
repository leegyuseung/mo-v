"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type InfoEditRequestModalTexts = {
    title: string;
    description: string;
    contentRequired: string;
    submitSuccess: string;
    cancelButton: string;
    submitButton: string;
};

/**
 * 정보 수정 요청 모달 공통 컴포넌트.
 * vlist-detail, group-detail, crew-detail 에서 동일하게 사용되던 모달 UI를 통합한다.
 */
export default function InfoEditRequestModal({
    open,
    texts,
    isSubmitting,
    onSubmit,
    onClose,
}: {
    open: boolean;
    texts: InfoEditRequestModalTexts;
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
                    placeholder="수정이 필요한 내용을 입력해 주세요."
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
                        className="cursor-pointer bg-gray-800 text-white hover:bg-gray-900"
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
