import "./globals.css";
import RootProvider from "@/provider/root-provider";

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
