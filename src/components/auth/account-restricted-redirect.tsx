"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { ACCOUNT_RESTRICTED_STORAGE_KEY } from "@/lib/account-restricted";

export default function AccountRestrictedRedirect() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname === "/account-restricted") return;

    const raw = sessionStorage.getItem(ACCOUNT_RESTRICTED_STORAGE_KEY);
    if (!raw) return;

    window.location.replace("/account-restricted");
  }, [pathname]);

  return null;
}
