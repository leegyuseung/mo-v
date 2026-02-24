"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedGiftIcon from "@/components/common/animated-gift-icon";
import AnimatedRewardHeart from "@/components/common/animated-reward-heart";

type GiftEventModalProps = {
  open: boolean;
  giftAmount: number | null;
  isGiftOpening: boolean;
  onOpenGiftBox: () => void;
  onClose: () => void;
};

/** 선물 이벤트 모달: 하루 한 번 선물상자를 열어 하트를 획득한다 */
export default function GiftEventModal({
  open,
  giftAmount,
  isGiftOpening,
  onOpenGiftBox,
  onClose,
}: GiftEventModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900">선물 이벤트</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-gray-500 hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-500">하루 한 번 선물상자를 열고 하트를 받아보세요.</p>
          <p className="mt-1 text-xs font-medium text-rose-500">랜덤 1~50하트</p>
        </div>

        <div className="mb-5 flex min-h-[180px] items-center justify-center">
          {giftAmount === null ? (
            <button
              type="button"
              onClick={onOpenGiftBox}
              disabled={isGiftOpening}
              className={`relative inline-flex h-28 w-28 items-center justify-center rounded-2xl bg-white text-gray-900 transition ${isGiftOpening ? "scale-110 animate-pulse" : "hover:scale-105"
                }`}
            >
              <AnimatedGiftIcon className="h-20 w-20 text-black cursor-pointer" />
            </button>
          ) : (
            <div className="text-center">
              <AnimatedRewardHeart className="mx-auto mb-2" />
              <p className="text-sm text-gray-500">오늘 받은 하트</p>
              <p className="mt-1 text-3xl font-bold text-red-600">
                {giftAmount.toLocaleString()}하트
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          {giftAmount === null ? (
            <Button
              type="button"
              onClick={onOpenGiftBox}
              disabled={isGiftOpening}
              className="cursor-pointer bg-black hover:bg-gray-900 text-white"
            >
              {isGiftOpening ? "상자 여는 중..." : "상자 열기"}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={onClose}
              className="cursor-pointer bg-gray-800 hover:bg-gray-900 text-white"
            >
              확인
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
