"use client";

import { motion } from "framer-motion";

type AnimatedGiftIconProps = {
  className?: string;
};

const lidVariants = {
  closed: {
    y: 0,
    rotate: 0,
    transition: { duration: 0.2 },
  },
  open: {
    y: -5,
    rotate: -24,
    transition: { type: "spring" as const, stiffness: 300, damping: 15 },
  },
};

const sparkleVariants = {
  closed: {
    opacity: 0.65,
    y: 0,
    scale: 1,
  },
  open: {
    opacity: 1,
    y: -9.5,
    scale: 1.06,
    transition: { delay: 0.06, duration: 0.18 },
  },
};

export default function AnimatedGiftIcon({ className }: AnimatedGiftIconProps) {
  return (
    <motion.svg
      initial="closed"
      whileHover="open"
      width="16"
      height="16"
      viewBox="-2 -8 28 34"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`overflow-visible ${className || ""}`}
      aria-hidden="true"
    >
      <motion.path variants={sparkleVariants} d="M12 7V1M9 4l3-3 3 3" />

      <path d="M4 10h16v10H4z" />
      <path d="M12 10v10" />

      <motion.g
        variants={lidVariants}
        style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}
      >
        <path d="M3 7h18v3H3z" />
        <path d="M12 7v3" />
      </motion.g>
    </motion.svg>
  );
}
