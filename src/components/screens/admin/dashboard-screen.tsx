"use client";

import { useDashboardStats } from "@/hooks/queries/admin/use-dashboard-stats";
import type { DashboardStats } from "@/types/admin";
import {
    Users,
    Mail,
    Globe,
    MessageCircle,
    TvMinimalPlay,
} from "lucide-react";

export default function DashboardScreen() {
    const { data: stats, isLoading } = useDashboardStats();

    const statCards = stats
        ? [
            {
                title: "전체 유저",
                value: stats.totalUsers,
                icon: Users,
                color: "from-blue-500 to-blue-600",
                bgLight: "bg-blue-50",
                textColor: "text-blue-600",
            },
            {
                title: "이메일 가입",
                value: stats.emailUsers,
                icon: Mail,
                color: "from-emerald-500 to-emerald-600",
                bgLight: "bg-emerald-50",
                textColor: "text-emerald-600",
            },
            {
                title: "구글 가입",
                value: stats.googleUsers,
                icon: Globe,
                color: "from-red-500 to-red-600",
                bgLight: "bg-red-50",
                textColor: "text-red-600",
            },
            {
                title: "카카오 가입",
                value: stats.kakaoUsers,
                icon: MessageCircle,
                color: "from-yellow-500 to-amber-500",
                bgLight: "bg-yellow-50",
                textColor: "text-yellow-600",
            },
            {
                title: "등록된 스트리머",
                value: stats.totalStreamers,
                icon: TvMinimalPlay,
                color: "from-purple-500 to-purple-600",
                bgLight: "bg-purple-50",
                textColor: "text-purple-600",
            },
        ]
        : [];

    return (
        <div className="p-6 md:p-10 max-w-6xl mx-auto">
            {/* 헤더 */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
                <p className="text-sm text-gray-500 mt-1">
                    mo-v 서비스 현황을 한눈에 확인하세요.
                </p>
            </div>

            {/* 통계 카드 */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-white rounded-2xl p-6 shadow-sm animate-pulse"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-xl" />
                                <div className="w-16 h-4 bg-gray-200 rounded" />
                            </div>
                            <div className="w-20 h-8 bg-gray-200 rounded mt-2" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {statCards.map((card) => (
                        <div
                            key={card.title}
                            className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl ${card.bgLight}`}>
                                    <card.icon className={`w-6 h-6 ${card.textColor}`} />
                                </div>
                                <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                                    {card.title}
                                </span>
                            </div>
                            <div className="flex items-end gap-2">
                                <span className="text-3xl font-bold text-gray-900">
                                    {card.value.toLocaleString()}
                                </span>
                                <span className="text-sm text-gray-400 mb-1">명</span>
                            </div>
                            <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full bg-gradient-to-r ${card.color}`}
                                    style={{
                                        width: `${Math.min(
                                            100,
                                            stats!.totalUsers > 0
                                                ? (card.value / stats!.totalUsers) * 100
                                                : 0
                                        )}%`,
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
