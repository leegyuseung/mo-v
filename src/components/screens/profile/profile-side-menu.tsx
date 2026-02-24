"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, UserRound } from "lucide-react";

const profileMenus = [
  { href: "/profile", label: "프로필 수정", icon: UserRound },
  { href: "/profile/requests", label: "내 요청 내역", icon: ClipboardList },
];

function isActive(pathname: string, href: string) {
  if (href === "/profile") return pathname === "/profile";
  return pathname.startsWith(href);
}

export default function ProfileSideMenu() {
  const pathname = usePathname();

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-2 shadow-sm">
      <nav className="flex gap-2 overflow-x-auto">
        {profileMenus.map((menu) => {
          const active = isActive(pathname, menu.href);

          return (
            <Link
              key={menu.href}
              href={menu.href}
              className={`flex min-w-[140px] items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <menu.icon className="h-4 w-4" />
              {menu.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
