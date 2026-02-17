import type { Metadata } from "next";
import "./globals.css";
import RootProvider from "@/provider/root-provider";
import { buildDefaultMetadata } from "@/lib/seo";

export const metadata: Metadata = buildDefaultMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
