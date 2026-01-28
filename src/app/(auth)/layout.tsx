import "../globals.css";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen w-full items-center justify-center bg-white">
          {children}
        </div>
      </body>
    </html>
  );
}
