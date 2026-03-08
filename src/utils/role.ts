import type { AppRole } from "@/types/app-role";

export function normalizeRole(role?: string | null): string {
  return (role || "").trim().toLowerCase();
}

export function hasAdminAccess(role?: string | null): boolean {
  const normalizedRole = normalizeRole(role);
  return normalizedRole === "admin" || normalizedRole === "manager";
}

export function isAdminRole(role?: string | null): boolean {
  return normalizeRole(role) === "admin";
}

export function isAppRole(role: string): role is AppRole {
  return role === "admin" || role === "manager" || role === "user";
}
