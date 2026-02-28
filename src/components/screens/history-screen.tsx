"use client";

import { useMemo, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useHeartPointHistory } from "@/hooks/queries/heart/use-heart-point-history";
import { Heart, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { HeartPointHistory } from "@/types/profile";
import Pagination from "@/components/common/pagination";

// 히스토리 타입별 라벨
const typeLabels: Record<string, string> = {
    profile_first_edit: "첫 프로필 수정 보너스",
    signup_bonus: "가입 보너스",
    gift_sent: "선물 전송",
    gift_received: "선물 수령",
    purchase: "구매",
    etc: "기타",
};
const HISTORY_PAGE_SIZE = 15;

function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}.${month}.${day} ${hours}:${minutes}`;
}

export default function HistoryScreen() {
    const router = useRouter();
    const { user, heartPoints, isLoading: isAuthLoading, isInitialized } = useAuthStore();
    const [currentPage, setCurrentPage] = useState(1);

    // 로그인 안 되어있으면 로그인 페이지로 이동
    useEffect(() => {
        if (isInitialized && !isAuthLoading && !user) {
            router.replace("/login");
        }
    }, [user, isAuthLoading, isInitialized, router]);

    const { data: historyData, isLoading } = useHeartPointHistory(user?.id);

    const history = historyData?.data || [];
    const totalPages = Math.max(1, Math.ceil(history.length / HISTORY_PAGE_SIZE));
    const safePage = Math.min(currentPage, totalPages);
    const pagedHistory = useMemo(() => {
        const start = (safePage - 1) * HISTORY_PAGE_SIZE;
        return history.slice(start, start + HISTORY_PAGE_SIZE);
    }, [history, safePage]);

    useEffect(() => {
        if (currentPage !== safePage) {
            setCurrentPage(safePage);
        }
    }, [currentPage, safePage]);

    // 로딩 중이거나 비로그인 상태 (리다이렉트 대기)
    if (!isInitialized || isAuthLoading || !user) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 max-w-2xl mx-auto">
            {/* 현재 포인트 카드 */}
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 mb-6 border border-rose-100">
                <div className="flex items-center gap-3 mb-2">
                    <Heart className="w-6 h-6 text-red-400 fill-red-400" />
                    <h1 className="text-lg font-bold text-gray-900">내 하트</h1>
                </div>
                <p className="text-3xl font-bold text-gray-900">
                    {heartPoints?.point?.toLocaleString() || 0}
                    <span className="text-base font-medium text-gray-500 ml-1">하트</span>
                </p>
            </div>

            {/* 히스토리 목록 */}
            <div>
                <h2 className="text-sm font-semibold text-gray-500 mb-3">
                    포인트 내역
                </h2>

                {isLoading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="h-16 bg-gray-100 animate-pulse rounded-xl"
                            />
                        ))}
                    </div>
                ) : history.length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-sm">
                        포인트 내역이 없습니다.
                    </div>
                ) : (
                    <>
                        <div className="space-y-2">
                            {pagedHistory.map((item: HeartPointHistory) => (
                                <div
                                    key={item.id}
                                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        {item.amount >= 0 ? (
                                            <ArrowUpCircle className="w-5 h-5 text-blue-500 shrink-0" />
                                        ) : (
                                            <ArrowDownCircle className="w-5 h-5 text-red-500 shrink-0" />
                                        )}
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {item.description ||
                                                    (item.type && typeLabels[item.type]) ||
                                                    item.type || "기타"}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {formatDate(item.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p
                                            className={`text-sm font-bold ${item.amount >= 0 ? "text-blue-600" : "text-red-500"
                                                }`}
                                        >
                                            {item.amount >= 0 ? "+" : ""}
                                            {item.amount.toLocaleString()} 하트
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            잔액 {item.after_point.toLocaleString()} 하트
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Pagination page={safePage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </>
                )}
            </div>
        </div>
    );
}
