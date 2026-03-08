import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { hasAdminAccess } from "@/utils/role";
import AdminSideBar from "@/components/common/admin-side-bar";
import AdminAuthGuard from "@/components/common/admin-auth-guard";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * 어드민 레이아웃.
 * 서버 사이드에서 세션 + role을 검증하여 비인가 접근을 차단한다.
 * AdminAuthGuard(클라이언트)는 UX 보조용으로 유지한다.
 */
export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !hasAdminAccess(profile.role)) redirect("/login");

  return (
    <AdminAuthGuard>
      <SidebarProvider>
        <AdminSideBar />
        <SidebarInset className="h-screen overflow-hidden bg-gray-50">
          <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </AdminAuthGuard>
  );
}
