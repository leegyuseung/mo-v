import AppSideBar from "@/components/common/app-side-bar";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppHeader from "@/components/common/app-header";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <AppSideBar />
      <div className="w-full">
        <AppHeader />
        {children}
      </div>
    </SidebarProvider>
  );
}
