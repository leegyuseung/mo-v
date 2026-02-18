import type { Metadata } from "next";
import AdminSideBar from "@/components/common/admin-side-bar";
import AdminAuthGuard from "@/components/common/admin-auth-guard";
import { SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AdminAuthGuard>
      <SidebarProvider>
        <AdminSideBar />
        <div className="w-full h-screen overflow-hidden flex flex-col bg-gray-50">
          <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
        </div>
      </SidebarProvider>
    </AdminAuthGuard>
  );
}
