import AppSideBar from "@/components/common/app-side-bar";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";

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
          {children}
        </SidebarProvider>
      </body>
    </html>
  );
}
