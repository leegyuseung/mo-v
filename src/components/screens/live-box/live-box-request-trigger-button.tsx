"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import LiveBoxRequestModal from "@/components/screens/live-box/live-box-request-modal";
import { cn } from "@/lib/utils";

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
        onClick={() => setIsModalOpen(true)}
        className={cn(
          "h-9 cursor-pointer whitespace-nowrap bg-gray-800 text-white hover:bg-gray-900",
          className
        )}
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
