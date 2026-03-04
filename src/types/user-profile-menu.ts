import type { ReactNode } from "react";

export type UserProfileMenuTriggerProps = {
  userPublicId?: string | null;
  label?: string;
  children?: ReactNode;
  ariaLabel?: string;
  className?: string;
  align?: "left" | "right";
};
