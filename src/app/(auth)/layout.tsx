import type { Metadata } from "next";
import "../globals.css";
import AuthGuard from "@/components/auth/auth-guard";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-white px-4">
      <AuthGuard>{children}</AuthGuard>
    </div>
  );
}
