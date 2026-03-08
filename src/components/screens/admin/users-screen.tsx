"use client";

import { useMemo, useState } from "react";
import { useUsers } from "@/hooks/queries/admin/use-users";
import { Users } from "lucide-react";
import { UserTable } from "@/components/screens/admin/users-tables";
import SearchInput from "@/components/common/search-input";
import type { AccountStatus } from "@/types/account-status";
import type { AppRole } from "@/types/app-role";
import { getEffectiveAccountStatus } from "@/utils/account-status";

const STATUS_FILTER_OPTIONS: Array<{ value: "all" | AccountStatus; label: string }> = [
  { value: "all", label: "전체" },
  { value: "active", label: "정상" },
  { value: "suspended", label: "정지" },
  { value: "banned", label: "영구 정지" },
];

const ROLE_FILTER_OPTIONS: Array<{ value: "all" | AppRole; label: string }> = [
  { value: "all", label: "전체" },
  { value: "user", label: "user" },
  { value: "manager", label: "manager" },
  { value: "admin", label: "admin" },
];

const PROVIDER_FILTER_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "email", label: "email" },
  { value: "google", label: "google" },
  { value: "kakao", label: "kakao" },
] as const;

export default function UsersScreen() {
  const { data: users, isLoading: usersLoading } = useUsers();
  const [userKeyword, setUserKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AccountStatus>("all");
  const [roleFilter, setRoleFilter] = useState<"all" | AppRole>("all");
  const [providerFilter, setProviderFilter] =
    useState<(typeof PROVIDER_FILTER_OPTIONS)[number]["value"]>("all");

  const filteredUsers = useMemo(() => {
    if (!users) return users;
    const keyword = userKeyword.trim().toLowerCase();
    return users.filter((user) => {
      const matchesKeyword =
        !keyword ||
        (user.nickname || "").toLowerCase().includes(keyword) ||
        (user.latest_sanction?.reason || "").toLowerCase().includes(keyword);
      const matchesStatus =
        statusFilter === "all" ||
        getEffectiveAccountStatus(user) === statusFilter;
      const matchesRole =
        roleFilter === "all" ||
        (user.role === roleFilter);
      const matchesProvider =
        providerFilter === "all" ||
        (user.provider || "email") === providerFilter;

      return matchesKeyword && matchesStatus && matchesRole && matchesProvider;
    });
  }, [users, userKeyword, statusFilter, roleFilter, providerFilter]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <section>
        <div className="mb-4 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">유저 관리</h2>
              <p className="text-xs text-gray-400">
                {users ? `총 ${users.length}명` : "로딩 중..."}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">상태</span>
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value as "all" | AccountStatus)
                  }
                  className="h-9 min-w-[132px] rounded-md border border-gray-200 bg-white px-3 text-sm"
                >
                  {STATUS_FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">역할</span>
                <select
                  value={roleFilter}
                  onChange={(event) =>
                    setRoleFilter(event.target.value as "all" | AppRole)
                  }
                  className="h-9 min-w-[132px] rounded-md border border-gray-200 bg-white px-3 text-sm"
                >
                  {ROLE_FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">가입방식</span>
                <select
                  value={providerFilter}
                  onChange={(event) =>
                    setProviderFilter(
                      event.target.value as (typeof PROVIDER_FILTER_OPTIONS)[number]["value"]
                    )
                  }
                  className="h-9 min-w-[132px] rounded-md border border-gray-200 bg-white px-3 text-sm"
                >
                  {PROVIDER_FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <SearchInput
              value={userKeyword}
              onChange={setUserKeyword}
              placeholder="유저 닉네임 검색"
              inputClassName="h-9 w-full md:w-64"
              containerClassName="w-full md:w-64"
            />
          </div>
        </div>
        <UserTable users={filteredUsers} isLoading={usersLoading} />
      </section>
    </div>
  );
}
