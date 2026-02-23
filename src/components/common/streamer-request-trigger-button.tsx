"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import StreamerRequestModal from "@/components/screens/vlist/streamer-request-modal";

type StreamerRequestTriggerButtonProps = {
  label?: string;
  className?: string;
  onSubmitted?: () => void | Promise<void>;
};

export default function StreamerRequestTriggerButton({
  label = "버츄얼 추가",
  className,
  onSubmitted,
}: StreamerRequestTriggerButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuthStore();

  const handleClick = () => {
    if (!user) {
      toast.error("로그인 후 버츄얼 추가 요청이 가능합니다.");
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleClick}
        disabled={!user}
        className={className}
      >
        {label}
      </Button>
      <StreamerRequestModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitted={onSubmitted}
      />
    </>
  );
}
