import type { ReactNode } from "react";

export type UserProfileMenuTriggerProps = {
  userPublicId?: string | null;
  label?: string;
  children?: ReactNode;
  ariaLabel?: string;
  className?: string;
  align?: "left" | "right";
};

export type UserAvatarNameMenuTriggerProps = {
  userPublicId?: string | null;
  nickname?: string | null;
  nicknameCode?: string | null;
  avatarUrl?: string | null;
  className?: string;
  nameClassName?: string;
  avatarClassName?: string;
  align?: "left" | "right";
};
