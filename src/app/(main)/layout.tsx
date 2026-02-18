import AppSideBar from "@/components/common/app-side-bar";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppHeader from "@/components/common/app-header";
import AppFooter from "@/components/common/app-footer";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <div className="w-full min-h-screen flex flex-col">
        <AppHeader />
        <div className="flex flex-1">
          <AppSideBar />
          <div className="w-full flex flex-col min-h-[calc(100vh-72px)]">
            <main className="flex-1">{children}</main>
            <AppFooter />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
