"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import LiveBoxRequestModal from "@/components/screens/live-box/live-box-request-modal";

type LiveBoxRequestTriggerButtonProps = {
  label?: string;
  className?: string;
  onSubmitted?: () => void | Promise<void>;
};

export default function LiveBoxRequestTriggerButton({
  label = "추가요청",
  className,
  onSubmitted,
}: LiveBoxRequestTriggerButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsModalOpen(true)}
        className={className}
      >
        {label}
      </Button>
      <LiveBoxRequestModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmitted={onSubmitted}
      />
    </>
  );
}
