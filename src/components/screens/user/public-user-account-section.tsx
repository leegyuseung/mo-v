import { CalendarDays, Heart, Mail } from "lucide-react";
import { formatSeoulDate } from "@/utils/seoul-time";
import type { PublicUserAccountSectionProps } from "@/types/public-user-profile";

export default function PublicUserAccountSection({
  canViewAccountInfo,
  accountInfo,
}: PublicUserAccountSectionProps) {
  return (
    <section className="mt-4 rounded-2xl border border-gray-100 bg-white p-5 md:p-6">
      <h2 className="text-base font-semibold text-gray-900">계정정보</h2>
      {!canViewAccountInfo ? (
        <p className="mt-2 text-sm text-gray-500">사용자가 계정정보를 비공개로 설정했습니다.</p>
      ) : accountInfo ? (
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="mb-1 text-xs text-gray-500">이메일</p>
            <p className="inline-flex items-center gap-1.5 text-sm text-gray-800">
              <Mail className="h-4 w-4 text-gray-400" />
              <span className="truncate">{accountInfo.email || "-"}</span>
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="mb-1 text-xs text-gray-500">가입일</p>
            <p className="inline-flex items-center gap-1.5 text-sm text-gray-800">
              <CalendarDays className="h-4 w-4 text-gray-400" />
              <span>{formatSeoulDate(accountInfo.createdAt, "-")}</span>
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="mb-1 text-xs text-gray-500">하트 포인트</p>
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900">
              <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
              <span>{accountInfo.heartPoint.toLocaleString()} 하트</span>
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-sm text-gray-500">표시할 계정정보가 없습니다.</p>
      )}
    </section>
  );
}
