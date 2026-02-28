import AppFooter from "@/components/common/app-footer";
import LogoOnlyHeader from "@/components/common/logo-only-header";

export default function LegalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-gray-50">
      <LogoOnlyHeader />
      <main>{children}</main>
      <AppFooter />
    </div>
  );
}
