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
      <div className="w-full h-screen overflow-hidden flex flex-col">
        <AppHeader />
        <div className="flex h-[calc(100vh-72px)] overflow-hidden">
          <AppSideBar />
          <div className="w-full min-h-0 overflow-y-auto">
            <div className="flex min-h-full flex-col">
              <main className="flex-1">{children}</main>
              <AppFooter />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
