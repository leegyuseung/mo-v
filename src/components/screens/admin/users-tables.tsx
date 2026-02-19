"use client";

import { useState } from "react";
import { useUpdateUser } from "@/hooks/mutations/admin/use-update-user";
import { useUpdateStreamer } from "@/hooks/mutations/admin/use-update-streamer";
import { useDeleteUser } from "@/hooks/mutations/admin/use-delete-user";
import { useDeleteStreamer } from "@/hooks/mutations/admin/use-delete-streamer";
import type { Profile } from "@/types/profile";
import type { Streamer } from "@/types/streamer";
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
  const [crewNameInput, setCrewNameInput] = useState(
    streamer.crew_name?.join(", ") || ""
  );
  const [imageUrl, setImageUrl] = useState(streamer.image_url || "");
  const [birthday, setBirthday] = useState(streamer.birthday || "");
  const [nationality, setNationality] = useState(streamer.nationality || "");
  const [gender, setGender] = useState(streamer.gender || "");
  const [genreInput, setGenreInput] = useState(streamer.genre?.join(", ") || "");
  const [firstStreamDate, setFirstStreamDate] = useState(
    streamer.first_stream_date || ""
  );
  const [fandomName, setFandomName] = useState(streamer.fandom_name || "");
  const [mbti, setMbti] = useState(streamer.mbti || "");
  const [aliasInput, setAliasInput] = useState(streamer.alias?.join(", ") || "");
  const [platformUrl, setPlatformUrl] = useState(streamer.platform_url || "");
  const [fancafeUrl, setFancafeUrl] = useState(streamer.fancafe_url || "");
  const [youtubeUrl, setYoutubeUrl] = useState(streamer.youtube_url || "");

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
          crew_name: parseTextArrayInput(crewNameInput),
          birthday: birthday || null,
          nationality: nationality || null,
          gender: gender || null,
          genre: parseTextArrayInput(genreInput),
          first_stream_date: firstStreamDate || null,
          fandom_name: fandomName || null,
          mbti: mbti || null,
          alias: parseTextArrayInput(aliasInput),
          platform_url: platformUrl || null,
          fancafe_url: fancafeUrl || null,
          youtube_url: youtubeUrl || null,
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
    setCrewNameInput(streamer.crew_name?.join(", ") || "");
    setImageUrl(streamer.image_url || "");
    setBirthday(streamer.birthday || "");
    setNationality(streamer.nationality || "");
    setGender(streamer.gender || "");
    setGenreInput(streamer.genre?.join(", ") || "");
    setFirstStreamDate(streamer.first_stream_date || "");
    setFandomName(streamer.fandom_name || "");
    setMbti(streamer.mbti || "");
    setAliasInput(streamer.alias?.join(", ") || "");
    setPlatformUrl(streamer.platform_url || "");
    setFancafeUrl(streamer.fancafe_url || "");
    setYoutubeUrl(streamer.youtube_url || "");
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteStreamerMutate(streamer.id);
    setIsDeleteAlertOpen(false);
  };

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
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
              value={crewNameInput}
              onChange={(e) => setCrewNameInput(e.target.value)}
              placeholder="크루명 (쉼표로 구분)"
              className="h-8 text-sm w-44"
            />
          ) : (
            <span className="text-gray-500 text-xs">
              {streamer.crew_name?.join(", ") || "-"}
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-sm">
          {isEditing ? (
            <Input
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              placeholder="생일 (예: 1월 15일)"
              className="h-8 text-sm w-44"
            />
          ) : (
            <span className="text-gray-500 text-xs">{streamer.birthday || "-"}</span>
          )}
        </td>
        <td className="px-4 py-3 text-sm">
          {isEditing ? (
            <Input
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              placeholder="국적"
              className="h-8 text-sm w-28"
            />
          ) : (
            <span className="text-gray-500 text-xs">{streamer.nationality || "-"}</span>
          )}
        </td>
        <td className="px-4 py-3 text-sm">
          {isEditing ? (
            <Input
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              placeholder="성별"
              className="h-8 text-sm w-24"
            />
          ) : (
            <span className="text-gray-500 text-xs">{streamer.gender || "-"}</span>
          )}
        </td>
        <td className="px-4 py-3 text-sm">
          {isEditing ? (
            <Input
              value={genreInput}
              onChange={(e) => setGenreInput(e.target.value)}
              placeholder="장르 (쉼표로 구분)"
              className="h-8 text-sm w-44"
            />
          ) : (
            <span className="text-gray-500 text-xs">
              {streamer.genre?.join(", ") || "-"}
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-sm">
          {isEditing ? (
            <Input
              value={firstStreamDate}
              onChange={(e) => setFirstStreamDate(e.target.value)}
              placeholder="첫 방송일 (예: 2023년 5월)"
              className="h-8 text-sm w-44"
            />
          ) : (
            <span className="text-gray-500 text-xs">
              {streamer.first_stream_date || "-"}
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-sm">
          {isEditing ? (
            <Input
              value={fandomName}
              onChange={(e) => setFandomName(e.target.value)}
              placeholder="팬덤명"
              className="h-8 text-sm w-28"
            />
          ) : (
            <span className="text-gray-500 text-xs">{streamer.fandom_name || "-"}</span>
          )}
        </td>
        <td className="px-4 py-3 text-sm">
          {isEditing ? (
            <Input
              value={mbti}
              onChange={(e) => setMbti(e.target.value)}
              placeholder="MBTI"
              className="h-8 text-sm w-24"
            />
          ) : (
            <span className="text-gray-500 text-xs">{streamer.mbti || "-"}</span>
          )}
        </td>
        <td className="px-4 py-3 text-sm">
          {isEditing ? (
            <Input
              value={aliasInput}
              onChange={(e) => setAliasInput(e.target.value)}
              placeholder="별명 (쉼표로 구분)"
              className="h-8 text-sm w-44"
            />
          ) : (
            <span className="text-gray-500 text-xs">
              {streamer.alias?.join(", ") || "-"}
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-sm">
          {isEditing ? (
            <Input
              value={platformUrl}
              onChange={(e) => setPlatformUrl(e.target.value)}
              placeholder="플랫폼 주소"
              className="h-8 text-sm w-52"
            />
          ) : (
            <span className="text-gray-500 text-xs">{streamer.platform_url || "-"}</span>
          )}
        </td>
        <td className="px-4 py-3 text-sm">
          {isEditing ? (
            <Input
              value={fancafeUrl}
              onChange={(e) => setFancafeUrl(e.target.value)}
              placeholder="팬카페 주소"
              className="h-8 text-sm w-52"
            />
          ) : (
            <span className="text-gray-500 text-xs">{streamer.fancafe_url || "-"}</span>
          )}
        </td>
        <td className="px-4 py-3 text-sm">
          {isEditing ? (
            <Input
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="유튜브 주소"
              className="h-8 text-sm w-52"
            />
          ) : (
            <span className="text-gray-500 text-xs">{streamer.youtube_url || "-"}</span>
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
        title="버츄얼 삭제"
        description="정말 이 버츄얼을 삭제하시겠습니까?"
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto overflow-y-auto max-h-[560px]">
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto overflow-y-auto max-h-[560px]">
      <table className="min-w-[2680px] text-left">
        <thead>
          <tr className="bg-gray-50/80 border-b border-gray-100">
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">이미지</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">닉네임</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">플랫폼</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">치지직 ID</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">SOOP ID</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">그룹명(text[])</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">크루명(text[])</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">생일</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">국적</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">성별</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">장르</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">첫 방송일</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">팬덤명</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">MBTI</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">별명</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">플랫폼 주소</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">팬카페 주소</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">유튜브 주소</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-20">수정</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <TableSkeleton cols={19} />
          ) : streamers && streamers.length > 0 ? (
            streamers.map((streamer) => (
              <StreamerRow key={streamer.id} streamer={streamer} />
            ))
          ) : (
            <tr>
              <td colSpan={19} className="px-4 py-12 text-center text-gray-400 text-sm">
                등록된 버츄얼이 없습니다.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
