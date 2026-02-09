"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function RootProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());
  const { initializeSession } = useAuthStore();

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}

