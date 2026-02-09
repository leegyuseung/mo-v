"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, isLoading, isInitialized } = useAuthStore();

    useEffect(() => {
        // 초기화 완료 후 사용자가 로그인되어 있으면 홈으로 리다이렉트
        if (isInitialized && !isLoading && user) {
            router.replace("/");
        }
    }, [user, isLoading, isInitialized, router]);

    // 로딩 중이거나 초기화 중일 때
    if (!isInitialized || isLoading) {
        return (
            <div className="flex min-h-screen w-full items-center justify-center">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
            </div>
        );
    }

    // 이미 로그인된 경우 (리다이렉트 대기 중)
    if (user) {
        return null;
    }

    return <>{children}</>;
}
