"use client";

import { useState } from "react";
import { useUsers } from "@/hooks/queries/admin/use-users";
import { useStreamers } from "@/hooks/queries/admin/use-streamers";
import { useUpdateUser } from "@/hooks/mutations/admin/use-update-user";
import { useUpdateStreamer } from "@/hooks/mutations/admin/use-update-streamer";
import type { Profile, Streamer } from "@/api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Users,
    TvMinimalPlay,
    Pencil,
    Check,
    X,
} from "lucide-react";

// ── 유저 편집 행 ──
function UserRow({ user }: { user: Profile }) {
    const [isEditing, setIsEditing] = useState(false);
    const [nickname, setNickname] = useState(user.nickname || "");
    const [role, setRole] = useState(user.role || "user");
    const { mutate: updateUser, isPending } = useUpdateUser();

    const handleSave = () => {
        updateUser(
            { userId: user.id, updates: { nickname, role } },
            { onSuccess: () => setIsEditing(false) }
        );
    };

    const handleCancel = () => {
        setNickname(user.nickname || "");
        setRole(user.role || "user");
        setIsEditing(false);
    };

    return (
        <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
            <td className="px-4 py-3 text-sm text-gray-500 font-mono text-xs">
                {user.id.slice(0, 8)}...
            </td>
            <td className="px-4 py-3 text-sm text-gray-700">
                {user.email || "-"}
            </td>
            <td className="px-4 py-3 text-sm">
                <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.provider === "google"
                            ? "bg-red-50 text-red-600"
                            : user.provider === "kakao"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-emerald-50 text-emerald-600"
                        }`}
                >
                    {user.provider || "email"}
                </span>
            </td>
            <td className="px-4 py-3 text-sm">
                {isEditing ? (
                    <Input
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="h-8 text-sm w-32"
                    />
                ) : (
                    <span className="text-gray-700">{user.nickname || "-"}</span>
                )}
            </td>
            <td className="px-4 py-3 text-sm">
                {isEditing ? (
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="h-8 px-2 border rounded-md text-sm bg-white"
                    >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                    </select>
                ) : (
                    <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${user.role === "admin"
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-gray-100 text-gray-600"
                            }`}
                    >
                        {user.role}
                    </span>
                )}
            </td>
            <td className="px-4 py-3 text-sm text-gray-400">
                {new Date(user.created_at).toLocaleDateString("ko-KR")}
            </td>
            <td className="px-4 py-3">
                {isEditing ? (
                    <div className="flex gap-1">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleSave}
                            disabled={isPending}
                            className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 cursor-pointer"
                        >
                            <Check className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancel}
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                ) : (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditing(true)}
                        className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </Button>
                )}
            </td>
        </tr>
    );
}

// ── 스트리머 편집 행 ──
function StreamerRow({ streamer }: { streamer: Streamer }) {
    const [isEditing, setIsEditing] = useState(false);
    const [nickname, setNickname] = useState(streamer.nickname || "");
    const [platform, setPlatform] = useState(streamer.platform || "");
    const [chzzkId, setChzzkId] = useState(streamer.chzzk_id || "");
    const [soopId, setSoopId] = useState(streamer.soop_id || "");
    const [imageUrl, setImageUrl] = useState(streamer.image_url || "");
    const { mutate: update, isPending } = useUpdateStreamer();

    const handleSave = () => {
        update(
            {
                streamerId: streamer.id,
                updates: {
                    nickname,
                    platform,
                    chzzk_id: chzzkId || null,
                    soop_id: soopId || null,
                    image_url: imageUrl || null,
                },
            },
            { onSuccess: () => setIsEditing(false) }
        );
    };

    const handleCancel = () => {
        setNickname(streamer.nickname || "");
        setPlatform(streamer.platform || "");
        setChzzkId(streamer.chzzk_id || "");
        setSoopId(streamer.soop_id || "");
        setImageUrl(streamer.image_url || "");
        setIsEditing(false);
    };

    return (
        <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
            <td className="px-4 py-3 text-sm text-gray-500">{streamer.id}</td>
            <td className="px-4 py-3 text-sm">
                {isEditing ? (
                    <Input
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="h-8 text-sm w-28"
                    />
                ) : (
                    <span className="text-gray-700 font-medium">{streamer.nickname || "-"}</span>
                )}
            </td>
            <td className="px-4 py-3 text-sm">
                {isEditing ? (
                    <select
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value)}
                        className="h-8 px-2 border rounded-md text-sm bg-white"
                    >
                        <option value="chzzk">chzzk</option>
                        <option value="soop">soop</option>
                    </select>
                ) : (
                    <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${streamer.platform === "chzzk"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                            }`}
                    >
                        {streamer.platform}
                    </span>
                )}
            </td>
            <td className="px-4 py-3 text-sm">
                {isEditing ? (
                    <Input
                        value={chzzkId}
                        onChange={(e) => setChzzkId(e.target.value)}
                        placeholder="chzzk ID"
                        className="h-8 text-sm w-36"
                    />
                ) : (
                    <span className="text-gray-500 text-xs font-mono">
                        {streamer.chzzk_id ? `${streamer.chzzk_id.slice(0, 12)}...` : "-"}
                    </span>
                )}
            </td>
            <td className="px-4 py-3 text-sm">
                {isEditing ? (
                    <Input
                        value={soopId}
                        onChange={(e) => setSoopId(e.target.value)}
                        placeholder="soop ID"
                        className="h-8 text-sm w-28"
                    />
                ) : (
                    <span className="text-gray-500 text-xs">{streamer.soop_id || "-"}</span>
                )}
            </td>
            <td className="px-4 py-3 text-sm">
                {isEditing ? (
                    <Input
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="이미지 URL"
                        className="h-8 text-sm w-36"
                    />
                ) : (
                    <>
                        {streamer.image_url ? (
                            <img
                                src={streamer.image_url}
                                alt={streamer.nickname || ""}
                                className="w-8 h-8 rounded-full object-cover"
                            />
                        ) : (
                            <span className="text-gray-400 text-xs">없음</span>
                        )}
                    </>
                )}
            </td>
            <td className="px-4 py-3">
                {isEditing ? (
                    <div className="flex gap-1">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleSave}
                            disabled={isPending}
                            className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 cursor-pointer"
                        >
                            <Check className="w-4 h-4" />
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleCancel}
                            className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                ) : (
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsEditing(true)}
                        className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </Button>
                )}
            </td>
        </tr>
    );
}

// ── 테이블 스켈레톤 ──
function TableSkeleton({ cols }: { cols: number }) {
    return (
        <>
            {[...Array(3)].map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                    {[...Array(cols)].map((_, j) => (
                        <td key={j} className="px-4 py-3">
                            <Skeleton className="h-4 w-full" />
                        </td>
                    ))}
                </tr>
            ))}
        </>
    );
}

// ── 메인 페이지 ──
export default function AdminUsersPage() {
    const { data: users, isLoading: usersLoading } = useUsers();
    const { data: streamers, isLoading: streamersLoading } = useStreamers();

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
            {/* 유저 관리 */}
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
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100">
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">이메일</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">가입 방식</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">닉네임</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">역할</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">가입일</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-20">수정</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usersLoading ? (
                                <TableSkeleton cols={7} />
                            ) : users && users.length > 0 ? (
                                users.map((user) => <UserRow key={user.id} user={user} />)
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">
                                        등록된 유저가 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

            <Separator />

            {/* 스트리머 관리 */}
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
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100">
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">닉네임</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">플랫폼</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">치지직 ID</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">SOOP ID</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">이미지</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-20">수정</th>
                            </tr>
                        </thead>
                        <tbody>
                            {streamersLoading ? (
                                <TableSkeleton cols={7} />
                            ) : streamers && streamers.length > 0 ? (
                                streamers.map((s) => <StreamerRow key={s.id} streamer={s} />)
                            ) : (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">
                                        등록된 스트리머가 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
}
