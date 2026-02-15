"use client";

import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bgLight: string;
  textColor: string;
  ratioBase: number;
};

export function StatCard({
  title,
  value,
  icon: Icon,
  color,
  bgLight,
  textColor,
  ratioBase,
}: StatCardProps) {
  const ratio = Math.min(100, ratioBase > 0 ? (value / ratioBase) * 100 : 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
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
        <span className="text-sm text-gray-400 mb-1">명</span>
      </div>
      <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color}`}
          style={{ width: `${ratio}%` }}
        />
      </div>
    </div>
  );
}

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
