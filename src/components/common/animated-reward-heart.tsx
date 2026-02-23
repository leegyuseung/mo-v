"use client";

import { Heart } from "lucide-react";
import { motion } from "framer-motion";

type AnimatedRewardHeartProps = {
  className?: string;
};

export default function AnimatedRewardHeart({ className }: AnimatedRewardHeartProps) {
  return (
    <div className={`relative inline-flex h-16 w-16 items-center justify-center ${className || ""}`}>
      <motion.span
        aria-hidden="true"
        className="absolute inset-0 rounded-full bg-rose-200/70 blur-sm"
        animate={{ scale: [1, 1.18, 1], opacity: [0.55, 0.85, 0.55] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.span
        aria-hidden="true"
        className="absolute inset-1 rounded-full bg-gradient-to-br from-rose-50 to-red-100"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="relative z-10"
        animate={{ scale: [1, 1.14, 1], y: [0, -2, 0] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
      >
        <Heart className="h-8 w-8 fill-red-500 text-red-500 drop-shadow-[0_1px_3px_rgba(239,68,68,0.45)]" />
      </motion.div>
    </div>
  );
}
