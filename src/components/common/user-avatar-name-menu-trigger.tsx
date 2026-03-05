"use client";

import { UserRound } from "lucide-react";
import UserProfileMenuTrigger from "@/components/common/user-profile-menu-trigger";
import type { UserAvatarNameMenuTriggerProps } from "@/types/user-profile-menu";

export default function UserAvatarNameMenuTrigger({
  userPublicId,
  nickname,
  nicknameCode,
  avatarUrl,
  className = "inline-flex max-w-full cursor-pointer items-center gap-2 text-left text-gray-800 hover:text-gray-900",
  nameClassName = "truncate",
  avatarClassName = "inline-flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gray-100",
  align = "left",
}: UserAvatarNameMenuTriggerProps) {
  const displayName = `${nickname || "익명 유저"}${nicknameCode ? ` #${nicknameCode}` : ""}`;

  return (
    <UserProfileMenuTrigger
      userPublicId={userPublicId}
      align={align}
      ariaLabel={`${displayName} 메뉴 열기`}
      className={className}
    >
      <span className={avatarClassName}>
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={nickname || "user"}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <UserRound className="h-3.5 w-3.5 text-gray-400" />
        )}
      </span>
      <span className={nameClassName}>{displayName}</span>
    </UserProfileMenuTrigger>
  );
}
