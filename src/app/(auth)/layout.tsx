import "../globals.css";
import AuthGuard from "@/components/auth/auth-guard";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen w-full justify-center bg-white">
      <AuthGuard>{children}</AuthGuard>
    </div>
  );
}

