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
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 1분간 데이터를 fresh로 유지하여 불필요한 재요청을 방지한다
            staleTime: 60 * 1000,
            gcTime: 5 * 60 * 1000,
            // 탭 전환 시 자동 재요청을 비활성화하여 불필요한 네트워크 비용을 줄인다
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );
  const { initializeSession } = useAuthStore();

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      // BFCache(뒤로가기 캐시) 복귀 시 세션을 다시 확인한다.
      if (event.persisted) {
        initializeSession();
      }
    };

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, [initializeSession]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
