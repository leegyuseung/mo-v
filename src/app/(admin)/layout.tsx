"use client";

import AdminSideBar from "@/components/common/admin-side-bar";
import AdminAuthGuard from "@/components/common/admin-auth-guard";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <AdminAuthGuard>
            <SidebarProvider>
                <AdminSideBar />
                <div className="w-full flex flex-col min-h-screen bg-gray-50">
                    <main className="flex-1">{children}</main>
                </div>
            </SidebarProvider>
        </AdminAuthGuard>
    );
}
