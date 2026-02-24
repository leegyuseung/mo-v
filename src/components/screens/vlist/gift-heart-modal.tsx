"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ConfirmAlert from "@/components/common/confirm-alert";

type GiftHeartModalProps = {
  open: boolean;
  streamerNickname: string;
  availableHeartPoint: number;
  giftAmountInput: string;
  isGiftSubmitting: boolean;
  isGiftConfirmOpen: boolean;
  onAmountChange: (value: string) => void;
  onSetMaxAmount: () => void;
  onClose: () => void;
  onConfirm: () => void;
  onGiftHeart: () => void;
  onCancelConfirm: () => void;
};

/** 하트 선물 모달: 하트 포인트 입력 + 확인 다이얼로그 */
export default function GiftHeartModal({
  open,
  streamerNickname,
  availableHeartPoint,
  giftAmountInput,
  isGiftSubmitting,
  isGiftConfirmOpen,
  onAmountChange,
  onSetMaxAmount,
  onClose,
  onConfirm,
  onGiftHeart,
  onCancelConfirm,
}: GiftHeartModalProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-100 bg-white p-5 shadow-xl">
          <h2 className="text-lg font-semibold text-gray-900">하트 선물하기</h2>
          <p className="mt-1 text-sm text-gray-500">
            보유 하트 포인트:{" "}
            <span className="font-semibold text-gray-900">
              {availableHeartPoint.toLocaleString()} 하트
            </span>
          </p>

          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm text-gray-600">선물할 하트 포인트</p>
              <button
                type="button"
                className="text-xs font-medium text-rose-600 hover:text-rose-700 cursor-pointer disabled:cursor-not-allowed disabled:text-gray-400"
                onClick={onSetMaxAmount}
                disabled={isGiftSubmitting || availableHeartPoint <= 0}
              >
                최대하트입력
              </button>
            </div>
            <Input
              type="number"
              min={1}
              max={Math.max(0, availableHeartPoint)}
              step={1}
              value={giftAmountInput}
              onChange={(event) => onAmountChange(event.target.value)}
              placeholder="선물할 하트 포인트를 입력해 주세요"
              className="h-10 bg-white border-gray-200"
              disabled={isGiftSubmitting}
            />
          </div>

          <div className="mt-5 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={onClose}
              disabled={isGiftSubmitting}
            >
              취소
            </Button>
            <Button
              type="button"
              className="cursor-pointer bg-rose-600 text-white hover:bg-rose-700"
              onClick={onConfirm}
              disabled={isGiftSubmitting || availableHeartPoint <= 0}
            >
              선물하기
            </Button>
          </div>
        </div>
      </div>

      <ConfirmAlert
        open={isGiftConfirmOpen}
        title="하트 선물"
        description={`${streamerNickname}님께 ${Number(giftAmountInput || 0).toLocaleString()}하트를 선물하시겠습니까?`}
        confirmText="확인"
        cancelText="취소"
        confirmVariant="default"
        isPending={isGiftSubmitting}
        onConfirm={onGiftHeart}
        onCancel={onCancelConfirm}
      />
    </>
  );
}
