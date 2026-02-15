"use client";

import { useUsers } from "@/hooks/queries/admin/use-users";
import { useStreamers } from "@/hooks/queries/admin/use-streamers";
import { Separator } from "@/components/ui/separator";
import { Users, TvMinimalPlay } from "lucide-react";
import { StreamerTable, UserTable } from "@/components/screens/admin/users-tables";

export default function UsersScreen() {
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: streamers, isLoading: streamersLoading } = useStreamers();

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
      <section>
        <div className="flex items-center gap-3 mb-4">
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
        <UserTable users={users} isLoading={usersLoading} />
      </section>

      <Separator />

      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-50 rounded-lg">
            <TvMinimalPlay className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">스트리머 관리</h2>
            <p className="text-xs text-gray-400">
              {streamers ? `총 ${streamers.length}명` : "로딩 중..."}
            </p>
          </div>
        </div>
        <StreamerTable streamers={streamers} isLoading={streamersLoading} />
      </section>
    </div>
  );
}
