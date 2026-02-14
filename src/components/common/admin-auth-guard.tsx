"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { Shield } from "lucide-react";

export default function AdminAuthGuard({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { user, profile, isLoading, isInitialized } = useAuthStore();
    const [checked, setChecked] = useState(false);

    useEffect(() => {
        if (!isInitialized || isLoading) return;

        if (!user || profile?.role !== "admin") {
            router.replace("/login");
        } else {
            setChecked(true);
        }
    }, [user, profile, isLoading, isInitialized, router]);

    if (!checked) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="flex flex-col items-center gap-3">
                    <Shield className="w-10 h-10 text-gray-300 animate-pulse" />
                    <p className="text-sm text-gray-400">권한을 확인하고 있습니다...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
