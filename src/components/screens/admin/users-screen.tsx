"use client";

import { useMemo, useState } from "react";
import { useUsers } from "@/hooks/queries/admin/use-users";
import { useStreamers } from "@/hooks/queries/admin/use-streamers";
import { Separator } from "@/components/ui/separator";
import { Users, TvMinimalPlay } from "lucide-react";
import { StreamerTable, UserTable } from "@/components/screens/admin/users-tables";
import { Input } from "@/components/ui/input";

export default function UsersScreen() {
  const { data: users, isLoading: usersLoading } = useUsers();
  const { data: streamers, isLoading: streamersLoading } = useStreamers();
  const [userKeyword, setUserKeyword] = useState("");
  const [streamerKeyword, setStreamerKeyword] = useState("");

  const filteredUsers = useMemo(() => {
    if (!users) return users;
    const keyword = userKeyword.trim().toLowerCase();
    if (!keyword) return users;
    return users.filter((user) =>
      (user.nickname || "").toLowerCase().includes(keyword)
    );
  }, [users, userKeyword]);

  const filteredStreamers = useMemo(() => {
    if (!streamers) return streamers;
    const keyword = streamerKeyword.trim().toLowerCase();
    if (!keyword) return streamers;
    return streamers.filter((streamer) =>
      (streamer.nickname || "").toLowerCase().includes(keyword)
    );
  }, [streamers, streamerKeyword]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
      <section>
        <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
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
          <Input
            value={userKeyword}
            onChange={(e) => setUserKeyword(e.target.value)}
            placeholder="유저 닉네임 검색"
            className="h-9 w-full md:w-64"
          />
        </div>
        <UserTable users={filteredUsers} isLoading={usersLoading} />
      </section>

      <Separator />

      <section>
        <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <TvMinimalPlay className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">버츄얼 관리</h2>
              <p className="text-xs text-gray-400">
                {streamers ? `총 ${streamers.length}명` : "로딩 중..."}
              </p>
            </div>
          </div>
          <Input
            value={streamerKeyword}
            onChange={(e) => setStreamerKeyword(e.target.value)}
            placeholder="버츄얼 닉네임 검색"
            className="h-9 w-full md:w-64"
          />
        </div>
        <StreamerTable streamers={filteredStreamers} isLoading={streamersLoading} />
      </section>
    </div>
  );
}
