"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { UserProfileMenuTriggerProps } from "@/types/user-profile-menu";

export default function UserProfileMenuTrigger({
  userPublicId,
  label,
  children,
  ariaLabel,
  className,
  align = "left",
}: UserProfileMenuTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const canOpenMenu = Boolean(userPublicId);
  const resolvedPublicId = userPublicId ?? "";
  const content = children ?? label ?? "";

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!rootRef.current) return;
      if (rootRef.current.contains(event.target as Node)) return;
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (!canOpenMenu) {
    return <span className={className}>{content}</span>;
  }

  return (
    <div className="relative inline-flex max-w-full" ref={rootRef}>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        aria-label={ariaLabel || (typeof label === "string" ? label : "유저 메뉴")}
        className={className}
      >
        {content}
      </button>
      {isOpen ? (
        <div
          className={`absolute top-full z-30 mt-1 w-28 rounded-md border border-gray-200 bg-white p-1 shadow-md ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          <Link
            href={`/user/${encodeURIComponent(resolvedPublicId)}`}
            onClick={() => setIsOpen(false)}
            className="block rounded px-2 py-1.5 text-xs text-gray-700 transition-colors hover:bg-gray-100"
          >
            프로필 보기
          </Link>
        </div>
      ) : null}
    </div>
  );
}
