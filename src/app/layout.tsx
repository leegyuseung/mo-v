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
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
        />
      </head>
      <body>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
