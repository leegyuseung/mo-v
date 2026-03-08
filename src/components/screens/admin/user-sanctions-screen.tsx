"use client";

import { useMemo, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { useAllUserSanctions } from "@/hooks/queries/admin/use-all-user-sanctions";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { UserSanctionSummary } from "@/types/profile";
import { getAccountStatusBadgeClassName, getAccountStatusLabel } from "@/utils/account-status";

type ActionFilter = "all" | "suspend" | "ban" | "unsuspend";

function getActionLabel(actionType: string) {
  if (actionType === "unsuspend") return "해제";
  if (actionType === "ban") return "영구 정지";
  return "일시 정지";
}

function getRoleBadgeClassName(role?: string | null) {
  if (role === "admin") {
    return "bg-indigo-100 text-indigo-700";
  }

  if (role === "manager") {
    return "bg-sky-100 text-sky-700";
  }

  return "bg-gray-100 text-gray-600";
}

function HistoryTableSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="divide-y divide-gray-100">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-7">
            {Array.from({ length: 7 }).map((__, cellIndex) => (
              <Skeleton key={cellIndex} className="h-4 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function SanctionActor({
  name,
  email,
  role,
}: {
  name?: string | null;
  email?: string | null;
  role?: string | null;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-gray-900">{name || email || "-"}</p>
        {email ? <p className="truncate text-xs text-gray-400">{email}</p> : null}
      </div>
      {role ? (
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${getRoleBadgeClassName(
            role
          )}`}
        >
          {role}
        </span>
      ) : null}
    </div>
  );
}

function SanctionRow({ sanction }: { sanction: UserSanctionSummary }) {
  return (
    <div className="grid grid-cols-1 gap-3 px-4 py-4 text-sm md:grid-cols-[1.4fr_1fr_1fr_1.1fr_1.4fr_1.2fr_1.6fr] md:items-center">
      <div className="min-w-0">
        <p className="truncate font-medium text-gray-900">
          {sanction.user_name || sanction.user_email || sanction.user_id || "-"}
        </p>
        {sanction.user_email ? (
          <p className="truncate text-xs text-gray-400">{sanction.user_email}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
          {getActionLabel(sanction.action_type)}
        </span>
        {sanction.account_status ? (
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${getAccountStatusBadgeClassName(
              sanction.account_status as "active" | "suspended" | "banned"
            )}`}
          >
            {getAccountStatusLabel(
              sanction.account_status as "active" | "suspended" | "banned"
            )}
          </span>
        ) : null}
      </div>
      <div className="text-sm text-gray-600">
        {sanction.duration_days ? `${sanction.duration_days}일` : sanction.action_type === "ban" ? "영구" : "-"}
      </div>
      <div className="text-sm text-gray-600">
        {sanction.suspended_until
          ? new Date(sanction.suspended_until).toLocaleString("ko-KR")
          : "-"}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm text-gray-800">{sanction.reason}</p>
        {sanction.internal_note ? (
          <p className="truncate text-xs text-gray-400">{sanction.internal_note}</p>
        ) : null}
      </div>
      <SanctionActor
        name={sanction.created_by_name}
        email={sanction.created_by_email}
        role={sanction.created_by_role}
      />
      <div className="text-sm text-gray-500">
        {new Date(sanction.created_at).toLocaleString("ko-KR")}
      </div>
    </div>
  );
}

export default function UserSanctionsScreen() {
  const { data: sanctions, isLoading } = useAllUserSanctions();
  const [keyword, setKeyword] = useState("");
  const [actionFilter, setActionFilter] = useState<ActionFilter>("all");

  const filteredSanctions = useMemo(() => {
    if (!sanctions) return sanctions;

    const normalizedKeyword = keyword.trim().toLowerCase();

    return sanctions.filter((sanction) => {
      const matchesAction =
        actionFilter === "all" ? true : sanction.action_type === actionFilter;

      if (!matchesAction) return false;
      if (!normalizedKeyword) return true;

      return [
        sanction.user_name,
        sanction.user_email,
        sanction.reason,
        sanction.internal_note,
        sanction.created_by_name,
        sanction.created_by_email,
      ]
        .filter(Boolean)
        .some((value) => (value || "").toLowerCase().includes(normalizedKeyword));
    });
  }, [actionFilter, keyword, sanctions]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 md:p-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-red-50 p-2">
            <ShieldAlert className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">제재 이력</h1>
            <p className="text-xs text-gray-400">
              {sanctions ? `최근 ${sanctions.length}건` : "로딩 중..."}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2 md:flex-row">
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "전체" },
              { value: "suspend", label: "일시 정지" },
              { value: "ban", label: "영구 정지" },
              { value: "unsuspend", label: "해제" },
            ].map((item) => (
              <Button
                key={item.value}
                type="button"
                variant={actionFilter === item.value ? "default" : "outline"}
                className="h-9"
                onClick={() => setActionFilter(item.value as ActionFilter)}
              >
                {item.label}
              </Button>
            ))}
          </div>
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="유저/사유/처리자 검색"
            className="h-9 w-full md:w-72"
          />
        </div>
      </div>

      {isLoading ? (
        <HistoryTableSkeleton />
      ) : filteredSanctions && filteredSanctions.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="hidden grid-cols-[1.4fr_1fr_1fr_1.1fr_1.4fr_1.2fr_1.6fr] gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3 text-xs font-medium text-gray-500 md:grid">
            <span>대상 유저</span>
            <span>처리 유형</span>
            <span>기간</span>
            <span>제한 종료</span>
            <span>사유</span>
            <span>처리자</span>
            <span>처리 시각</span>
          </div>
          <div className="divide-y divide-gray-100">
            {filteredSanctions.map((sanction, index) => (
              <SanctionRow
                key={`${sanction.user_id}-${sanction.created_at}-${index}`}
                sanction={sanction}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-400">
          표시할 제재 이력이 없습니다.
        </div>
      )}
    </div>
  );
}
