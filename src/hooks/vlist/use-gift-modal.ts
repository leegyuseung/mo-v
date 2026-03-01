"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { fetchHeartPoints, giftHeartToStreamer } from "@/api/heart";
import { toast } from "sonner";
import type { Streamer } from "@/types/streamer";

/**
 * 하트 선물 모달의 모든 상태와 로직을 캡슐화한다.
 * vlist-detail-screen에서 선물 관련 상태 5개 + 핸들러를 분리하기 위해 생성.
 */
export function useGiftModal(streamer: Streamer | null | undefined) {
  const GIFT_SUBMIT_LOCK_TTL_MS = 10_000;
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [giftAmountInput, setGiftAmountInput] = useState("");
  const [isGiftConfirmOpen, setIsGiftConfirmOpen] = useState(false);
  const [isGiftSubmitting, setIsGiftSubmitting] = useState(false);
  const giftSubmitLockTokenRef = useRef<string | null>(null);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, heartPoints, setHeartPoints } = useAuthStore();

  const availableHeartPoint = heartPoints?.point || 0;

  const openGiftModal = () => {
    if (!user) {
      toast.error("로그인 후 하트를 선물할 수 있습니다.");
      return;
    }
    setGiftAmountInput("");
    setIsGiftModalOpen(true);
  };

  const closeGiftModal = () => {
    if (isGiftSubmitting) return;
    setIsGiftModalOpen(false);
    setGiftAmountInput("");
    setIsGiftConfirmOpen(false);
  };

  const openGiftConfirm = () => {
    if (!user) {
      toast.error("로그인 후 하트를 선물할 수 있습니다.");
      return;
    }
    const amount = Number(giftAmountInput);
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount)) {
      toast.error("선물할 하트 포인트를 올바르게 입력해 주세요.");
      return;
    }
    if (amount > availableHeartPoint) {
      toast.error("보유 하트보다 큰 수는 입력할 수 없습니다.");
      return;
    }
    setIsGiftConfirmOpen(true);
  };

  const handleGiftHeart = async () => {
    if (!user || !streamer) {
      toast.error("로그인 후 하트를 선물할 수 있습니다.");
      return;
    }

    const amount = Number(giftAmountInput);
    if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount)) {
      toast.error("선물할 하트 포인트를 올바르게 입력해 주세요.");
      return;
    }
    if (amount > availableHeartPoint) {
      toast.error("보유 하트보다 큰 수는 입력할 수 없습니다.");
      return;
    }

    const canSubmit = (() => {
      if (!user) return false;
      const lockKey = `gift-heart-submit-lock:${user.id}`;
      const now = Date.now();
      const token = `${now}-${Math.random().toString(36).slice(2)}`;

      try {
        const raw = window.localStorage.getItem(lockKey);
        if (raw) {
          const parsed = JSON.parse(raw) as { token?: string; expiresAt?: number };
          if (typeof parsed.expiresAt === "number" && parsed.expiresAt > now) {
            return false;
          }
        }

        window.localStorage.setItem(
          lockKey,
          JSON.stringify({
            token,
            expiresAt: now + GIFT_SUBMIT_LOCK_TTL_MS,
          })
        );
        giftSubmitLockTokenRef.current = token;
        return true;
      } catch {
        // localStorage 접근 실패 환경에서는 기존 서버 검증에 위임한다.
        return true;
      }
    })();

    if (!canSubmit) {
      toast.info("다른 탭에서 하트 선물을 처리 중입니다. 잠시 후 다시 시도해 주세요.");
      return;
    }

    setIsGiftSubmitting(true);
    try {
      const targetName = streamer.nickname || "버츄얼";
      await giftHeartToStreamer(
        user.id,
        streamer.id,
        amount,
        `${targetName}님에게 하트 선물`
      );
      const refreshedHeartPoints = await fetchHeartPoints(user.id);
      setHeartPoints(refreshedHeartPoints);
      await queryClient.invalidateQueries({
        queryKey: ["streamer-received-heart-total", streamer.id],
      });
      await queryClient.invalidateQueries({
        queryKey: ["streamer-top-donors", streamer.id],
      });
      router.refresh();
      toast.success("하트 선물이 완료되었습니다.");
      setIsGiftConfirmOpen(false);
      setIsGiftModalOpen(false);
      setGiftAmountInput("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "하트 선물에 실패했습니다.";
      toast.error(message);
    } finally {
      if (user) {
        const lockKey = `gift-heart-submit-lock:${user.id}`;
        try {
          const raw = window.localStorage.getItem(lockKey);
          if (raw) {
            const parsed = JSON.parse(raw) as { token?: string };
            if (parsed.token && parsed.token === giftSubmitLockTokenRef.current) {
              window.localStorage.removeItem(lockKey);
            }
          }
        } catch {
          // noop
        } finally {
          giftSubmitLockTokenRef.current = null;
        }
      }
      setIsGiftSubmitting(false);
    }
  };

  /** 선물 입력값 변경 핸들러 — 숫자만 허용하며 보유 하트를 초과하지 않도록 클램핑 */
  const handleAmountChange = (nextValue: string) => {
    if (!nextValue) {
      setGiftAmountInput("");
      return;
    }
    if (!/^\d+$/.test(nextValue)) return;
    const parsed = Number(nextValue);
    if (parsed > availableHeartPoint) {
      setGiftAmountInput(String(availableHeartPoint));
      return;
    }
    setGiftAmountInput(nextValue);
  };

  const setMaxAmount = () => {
    setGiftAmountInput(String(availableHeartPoint));
  };

  return {
    isGiftModalOpen,
    giftAmountInput,
    isGiftConfirmOpen,
    isGiftSubmitting,
    availableHeartPoint,
    openGiftModal,
    closeGiftModal,
    openGiftConfirm,
    handleGiftHeart,
    handleAmountChange,
    setMaxAmount,
  };
}
