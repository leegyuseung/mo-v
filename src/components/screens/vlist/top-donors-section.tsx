"use client";

import { useState } from "react";
import { useStreamerTopDonors } from "@/hooks/queries/heart/use-streamer-top-donors";
import type { DonorPeriod } from "@/types/heart";

type TopDonorsSectionProps = {
  streamerId: number;
};

/** 하트 선물 TOP 5 섹션: 기간 선택 + 기부자 목록 */
export default function TopDonorsSection({ streamerId }: TopDonorsSectionProps) {
  const [donorPeriod, setDonorPeriod] = useState<DonorPeriod>("all");

  const {
    data: topDonors = [],
    isLoading: isTopDonorsLoading,
    isError: isTopDonorsError,
  } = useStreamerTopDonors(streamerId, donorPeriod);

  return (
    <div className="mt-4 w-full md:w-1/2">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-gray-700">하트 선물 TOP 5</p>
        <div className="inline-flex items-center rounded-full border border-gray-200 bg-white p-1">
          {[
            { key: "all" as const, label: "전체" },
            { key: "weekly" as const, label: "이번주" },
            { key: "monthly" as const, label: "이번달" },
          ].map((item) => {
            const active = donorPeriod === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setDonorPeriod(item.key)}
                className={`cursor-pointer rounded-full px-2.5 py-1 text-xs font-medium transition ${active
                  ? "bg-rose-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
      {isTopDonorsLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={`donor-skeleton-${index}`}
              className="h-8 animate-pulse rounded-md bg-gray-200/70"
            />
          ))}
        </div>
      ) : isTopDonorsError ? (
        <p className="text-sm text-red-500">
          하트 랭킹 조회에 실패했습니다. 기간별 뷰 SQL을 확인해 주세요.
        </p>
      ) : topDonors.length === 0 ? (
        <p className="text-sm text-gray-500">아직 하트 선물 내역이 없습니다.</p>
      ) : (
        <div className="space-y-2">
          {topDonors.slice(0, 5).map((donor, index) => (
            <div
              key={`${donor.user_id || "unknown"}-${index}`}
              className="flex items-center justify-between px-1 py-2 text-sm"
            >
              <span className="text-gray-700">{`${donor.donor_rank ?? index + 1}위`}</span>
              <span className="flex-1 px-3 text-gray-800">
                {donor.user_nickname || "익명 유저"}
              </span>
              <span className="font-semibold text-gray-900">{`${(donor.total_sent ?? 0).toLocaleString()} 하트`}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
