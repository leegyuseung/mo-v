"use client";

import { useState } from "react";
import { useUpdateUser } from "@/hooks/mutations/admin/use-update-user";
import { useUpdateStreamer } from "@/hooks/mutations/admin/use-update-streamer";
import { useDeleteUser } from "@/hooks/mutations/admin/use-delete-user";
import { useDeleteStreamer } from "@/hooks/mutations/admin/use-delete-streamer";
import type { Profile } from "@/types/profile";
import type { Streamer } from "@/types/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Check, X, Trash2 } from "lucide-react";
import ConfirmAlert from "@/components/common/confirm-alert";

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

function parseTextArrayInput(input: string): string[] | null {
  const parsed = input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return parsed.length > 0 ? parsed : null;
}

function UserRow({ user }: { user: Profile }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [nickname, setNickname] = useState(user.nickname || "");
  const [role, setRole] = useState(user.role || "user");
  const { mutate: updateUser, isPending } = useUpdateUser();
  const { mutate: deleteUserMutate, isPending: isDeleting } = useDeleteUser();

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

  const handleDelete = () => {
    deleteUserMutate(user.id);
    setIsDeleteAlertOpen(false);
  };

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
        <td className="px-4 py-3 text-sm text-gray-500 font-mono text-xs">
          {user.id.slice(0, 8)}...
        </td>
        <td className="px-4 py-3 text-sm text-gray-700">{user.email || "-"}</td>
        <td className="px-4 py-3 text-sm">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              user.provider === "google"
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
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                user.role === "admin"
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
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsDeleteAlertOpen(true)}
                disabled={isDeleting}
                className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </td>
      </tr>

      <ConfirmAlert
        open={isDeleteAlertOpen}
        title="유저 삭제"
        description="정말 이 유저를 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        isPending={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteAlertOpen(false)}
      />
    </>
  );
}

function StreamerRow({ streamer }: { streamer: Streamer }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [nickname, setNickname] = useState(streamer.nickname || "");
  const [platform, setPlatform] = useState(streamer.platform || "");
  const [chzzkId, setChzzkId] = useState(streamer.chzzk_id || "");
  const [soopId, setSoopId] = useState(streamer.soop_id || "");
  const [groupNameInput, setGroupNameInput] = useState(
    streamer.group_name?.join(", ") || ""
  );
  const [imageUrl, setImageUrl] = useState(streamer.image_url || "");

  const { mutate: update, isPending } = useUpdateStreamer();
  const { mutate: deleteStreamerMutate, isPending: isDeleting } =
    useDeleteStreamer();

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
          group_name: parseTextArrayInput(groupNameInput),
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
    setGroupNameInput(streamer.group_name?.join(", ") || "");
    setImageUrl(streamer.image_url || "");
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteStreamerMutate(streamer.id);
    setIsDeleteAlertOpen(false);
  };

  return (
    <>
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
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                streamer.platform === "chzzk"
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
              value={groupNameInput}
              onChange={(e) => setGroupNameInput(e.target.value)}
              placeholder="그룹명 (쉼표로 구분)"
              className="h-8 text-sm w-44"
            />
          ) : (
            <span className="text-gray-500 text-xs">
              {streamer.group_name?.join(", ") || "-"}
            </span>
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
          ) : streamer.image_url ? (
            <img
              src={streamer.image_url}
              alt={streamer.nickname || ""}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <span className="text-gray-400 text-xs">없음</span>
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
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <Pencil className="w-3.5 h-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsDeleteAlertOpen(true)}
                disabled={isDeleting}
                className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </td>
      </tr>

      <ConfirmAlert
        open={isDeleteAlertOpen}
        title="스트리머 삭제"
        description="정말 이 스트리머를 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        isPending={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteAlertOpen(false)}
      />
    </>
  );
}

type UserTableProps = {
  users?: Profile[];
  isLoading: boolean;
};

export function UserTable({ users, isLoading }: UserTableProps) {
  return (
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
          {isLoading ? (
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
  );
}

type StreamerTableProps = {
  streamers?: Streamer[];
  isLoading: boolean;
};

export function StreamerTable({ streamers, isLoading }: StreamerTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-50/80 border-b border-gray-100">
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">닉네임</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">플랫폼</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">치지직 ID</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">SOOP ID</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">그룹명(text[])</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">이미지</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-20">수정</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <TableSkeleton cols={8} />
          ) : streamers && streamers.length > 0 ? (
            streamers.map((streamer) => (
              <StreamerRow key={streamer.id} streamer={streamer} />
            ))
          ) : (
            <tr>
              <td colSpan={8} className="px-4 py-12 text-center text-gray-400 text-sm">
                등록된 스트리머가 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
