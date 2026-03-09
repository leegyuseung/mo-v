"use client";

import Link from "next/link";
import type { StatCardProps } from "@/types/admin-component-props";

/** 대시보드 통계 카드 — 제목, 수치, 아이콘, 비율 바를 표시한다 */
export function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bgLight,
  textColor,
  ratioBase,
  unit = "명",
  href,
}: StatCardProps) {
  const ratio = Math.min(100, ratioBase > 0 ? (value / ratioBase) * 100 : 0);
  const cardClassName =
    "bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-shadow";

  const content = (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${bgLight}`}>
          <Icon className={`w-6 h-6 ${textColor}`} />
        </div>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
          {title}
        </span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold text-gray-900">
          {value.toLocaleString()}
        </span>
        <span className="text-sm text-gray-400 mb-1">{unit}</span>
      </div>
      <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          style={{ width: `${ratio}%` }}
        />
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`${cardClassName} cursor-pointer hover:shadow-md hover:border-gray-200`}
      >
        {content}
      </Link>
    );
  }

  return <div className={cardClassName}>{content}</div>;
}

/** 통계 카드의 로딩 스켈레톤 */
export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-gray-200 rounded-xl" />
        <div className="w-16 h-4 bg-gray-200 rounded" />
      </div>
      <div className="w-20 h-8 bg-gray-200 rounded mt-2" />
    </div>
  );
}
