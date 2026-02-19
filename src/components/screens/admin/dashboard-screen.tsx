"use client";

import { useDashboardStats } from "@/hooks/queries/admin/use-dashboard-stats";
import {
    Users,
    Mail,
    Globe,
    MessageCircle,
    TvMinimalPlay,
    UsersRound,
} from "lucide-react";
import { StatCard, StatCardSkeleton } from "@/components/screens/admin/stat-card";

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
                title: "등록된 버츄얼",
                value: stats.totalStreamers,
                icon: TvMinimalPlay,
                color: "from-purple-500 to-purple-600",
                bgLight: "bg-purple-50",
                textColor: "text-purple-600",
            },
            {
                title: "등록된 그룹",
                value: stats.totalGroups,
                icon: UsersRound,
                color: "from-indigo-500 to-indigo-600",
                bgLight: "bg-indigo-50",
                textColor: "text-indigo-600",
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
                    {[...Array(6)].map((_, i) => (
                        <StatCardSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {statCards.map((card) => (
                        <StatCard
                            key={card.title}
                            title={card.title}
                            value={card.value}
                            icon={card.icon}
                            color={card.color}
                            bgLight={card.bgLight}
                            textColor={card.textColor}
                            ratioBase={stats?.totalUsers || 0}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
