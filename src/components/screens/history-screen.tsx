"use client";

import { useAuthStore } from "@/store/useAuthStore";
import { useHeartPointHistory } from "@/hooks/queries/heart/use-heart-point-history";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Pagination from "@/components/common/pagination";
import HistoryFilterBar from "@/components/screens/history/history-filter-bar";
import HistoryList from "@/components/screens/history/history-list";
import { useHistoryScreenState } from "@/hooks/history/use-history-screen-state";

export default function HistoryScreen() {
    const router = useRouter();
    const { user, heartPoints, isLoading: isAuthLoading, isInitialized } = useAuthStore();

    // 로그인 안 되어있으면 로그인 페이지로 이동
    useEffect(() => {
        if (isInitialized && !isAuthLoading && !user) {
            router.replace("/login");
        }
    }, [user, isAuthLoading, isInitialized, router]);

    const { data: historyData, isLoading } = useHeartPointHistory(user?.id);
    const {
        filter,
        typeFilter,
        startDateFilter,
        endDateFilter,
        historyTypeOptions,
        filteredHistory,
        pagedHistory,
        totalPages,
        safePage,
        setFilterAndResetPage,
        setTypeFilterAndResetPage,
        setStartDateFilterAndResetPage,
        setEndDateFilterAndResetPage,
        resetDateFilter,
        onPageChange,
    } = useHistoryScreenState(historyData?.data);

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
                <HistoryFilterBar
                    filter={filter}
                    typeFilter={typeFilter}
                    typeOptions={historyTypeOptions}
                    startDateFilter={startDateFilter}
                    endDateFilter={endDateFilter}
                    onChangeFilter={setFilterAndResetPage}
                    onChangeTypeFilter={setTypeFilterAndResetPage}
                    onChangeStartDateFilter={setStartDateFilterAndResetPage}
                    onChangeEndDateFilter={setEndDateFilterAndResetPage}
                    onResetDateFilter={resetDateFilter}
                />

                <HistoryList
                    isLoading={isLoading}
                    filteredCount={filteredHistory.length}
                    pagedHistory={pagedHistory}
                />

                {!isLoading && filteredHistory.length > 0 ? (
                    <Pagination
                        page={safePage}
                        totalPages={totalPages}
                        onPageChange={onPageChange}
                    />
                ) : null}
            </div>
        </div>
    );
}
