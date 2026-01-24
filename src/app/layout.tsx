import AppSideBar from "@/components/common/app-side-bar";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppHeader from "@/components/common/app-header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SidebarProvider>
          <AppSideBar />
          <div className="w-full">
            <AppHeader />
            {children}
          </div>
        </SidebarProvider>
      </body>
    </html>
  );
}
