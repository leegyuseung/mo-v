"use client";

import { Trash2 } from "lucide-react";
import IconTooltipButton from "@/components/common/icon-tooltip-button";
import type { AdminHomeBroadcastItem } from "@/types/admin-home-broadcast";
import type { AdminHomeBroadcastTableProps } from "@/types/admin-home-broadcast-screen";

function formatDateTime(value: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Seoul",
  }).format(date);
}

function getStatusLabel(item: AdminHomeBroadcastItem) {
  if (item.status === "deleted") return "삭제됨";
  if (item.status === "active") return "진행중";
  return "종료";
}

function getStatusClassName(item: AdminHomeBroadcastItem) {
  if (item.status === "deleted") return "text-red-600";
  if (item.status === "active") return "text-green-600";
  return "text-gray-500";
}

export default function HomeBroadcastsTable({
  items,
  isLoading,
  isError,
  onDeleteClick,
}: AdminHomeBroadcastTableProps) {
  return (
    <div className="max-h-[720px] overflow-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full min-w-[1180px] whitespace-nowrap text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/80">
            <th className="w-20 px-4 py-3 text-xs font-semibold uppercase text-gray-500">관리</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">상태</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">내용</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">작성자</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">작성일</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">종료예정일</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">삭제자</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">삭제일</th>
            <th className="px-4 py-3 text-xs font-semibold uppercase text-gray-500">삭제 사유</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            [...Array(6)].map((_, index) => (
              <tr key={`home-broadcast-skeleton-${index}`} className="border-b border-gray-100">
                <td className="px-4 py-4 text-sm text-gray-300" colSpan={9}>
                  불러오는 중...
                </td>
              </tr>
            ))
          ) : isError ? (
            <tr>
              <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-400">
                전광판 목록을 불러오지 못했습니다.
              </td>
            </tr>
          ) : items.length > 0 ? (
            items.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 align-top">
                <td className="px-4 py-3 text-sm text-gray-600">
                  {item.status !== "deleted" ? (
                    <IconTooltipButton
                      icon={Trash2}
                      label="삭제"
                      onClick={() => onDeleteClick(item)}
                      buttonClassName="h-7 w-7 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                      iconClassName="h-3.5 w-3.5"
                    />
                  ) : (
                    <span className="text-gray-300">-</span>
                  )}
                </td>
                <td className={`px-4 py-3 text-sm font-medium ${getStatusClassName(item)}`}>
                  {getStatusLabel(item)}
                </td>
                <td className="max-w-[360px] px-4 py-3 text-sm text-gray-800">
                  <p className="line-clamp-2 whitespace-normal break-words">{item.content}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{item.author_nickname || "-"}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(item.created_at)}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(item.expires_at)}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{item.deleted_by_label || "-"}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(item.deleted_at)}</td>
                <td className="max-w-[240px] px-4 py-3 text-sm text-gray-600">
                  <p className="line-clamp-2 whitespace-normal break-words">
                    {item.deleted_reason || "-"}
                  </p>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9} className="px-4 py-12 text-center text-sm text-gray-400">
                표시할 전광판이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
