"use client";

import { useState, type ReactNode } from "react";
import { useUpdateUser } from "@/hooks/mutations/admin/use-update-user";
import { useManageUserSanction } from "@/hooks/mutations/admin/use-manage-user-sanction";
import { useUserSanctions } from "@/hooks/queries/admin/use-user-sanctions";
import { useUpdateStreamer } from "@/hooks/mutations/admin/use-update-streamer";
import { useDeleteUser } from "@/hooks/mutations/admin/use-delete-user";
import { useDeleteStreamer } from "@/hooks/mutations/admin/use-delete-streamer";
import type { AdminUserProfile } from "@/types/profile";
import type { AccountStatus } from "@/types/account-status";
import type { AppRole } from "@/types/app-role";
import type { Streamer } from "@/types/streamer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil, Check, X, Trash2, UserLock, TextSearch } from "lucide-react";
import ConfirmAlert from "@/components/common/confirm-alert";
import IconTooltipButton from "@/components/common/icon-tooltip-button";
import { useAuthStore } from "@/store/useAuthStore";
import {
  getAccountStatusBadgeClassName,
  getAccountStatusLabel,
  getEffectiveAccountStatus,
} from "@/utils/account-status";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ROLE_OPTIONS: Array<{ value: AppRole; label: AppRole }> = [
  { value: "user", label: "user" },
  { value: "manager", label: "manager" },
  { value: "admin", label: "admin" },
];
const STREAMER_EDIT_FIELD_CLASS_NAME = "h-9 w-full md:w-[35%]";

function getRoleBadgeClassName(role?: string | null) {
  if (role === "admin") {
    return "bg-indigo-100 text-indigo-700";
  }

  if (role === "manager") {
    return "bg-sky-100 text-sky-700";
  }

  return "bg-gray-100 text-gray-600";
}

/** 테이블 로딩 시 표시되는 스켈레톤 */
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

/** 쉼표로 구분된 텍스트를 배열로 파싱. 빈 입력이면 null 반환 */
function parseTextArrayInput(input: string): string[] | null {
  const parsed = input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return parsed.length > 0 ? parsed : null;
}

/** URL 필드의 비편집 모드에서 사용되는 truncate 스타일 표시 컴포넌트 */
function TruncatedUrlDisplay({ url }: { url: string | null }) {
  return (
    <span
      className="inline-block max-w-[180px] truncate align-middle text-gray-500 text-xs"
      title={url || ""}
    >
      {url || "-"}
    </span>
  );
}

function formatFirstStreamDate(value: string | null) {
  if (!value) return "-";

  const trimmed = value.trim();
  const matched = trimmed.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
  if (!matched) return "-";

  const year = Number(matched[1]);
  const month = Number(matched[2]);
  const day = Number(matched[3]);
  if (!year || !month || !day) return "-";

  return `${year}년 ${month}월 ${day}일`;
}

function AdminEditSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
      <div className="mb-3">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        {description ? (
          <p className="text-xs text-gray-400">{description}</p>
        ) : null}
      </div>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </div>
  );
}

function AdminEditField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-gray-500">{label}</label>
      {children}
    </div>
  );
}

function UserRow({ user }: { user: AdminUserProfile }) {
  const { profile: currentProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isSuspendAlertOpen, setIsSuspendAlertOpen] = useState(false);
  const [isUnsuspendAlertOpen, setIsUnsuspendAlertOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [role, setRole] = useState<AppRole>(
    user.role === "admin" || user.role === "manager" ? user.role : "user"
  );
  const [suspendDuration, setSuspendDuration] = useState("1");
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendInternalNote, setSuspendInternalNote] = useState("");
  const { mutate: updateUser, isPending } = useUpdateUser();
  const { mutate: deleteUserMutate, isPending: isDeleting } = useDeleteUser();
  const { mutate: manageUserSanction, isPending: isManagingSanction } =
    useManageUserSanction();
  const { data: sanctions = [], isLoading: isSanctionsLoading } = useUserSanctions(
    user.id,
    isHistoryDialogOpen
  );
  const currentRole = currentProfile?.role || "user";
  const isCurrentAdmin = currentRole === "admin";
  const showSensitiveColumns = currentRole !== "manager";
  const effectiveStatus = getEffectiveAccountStatus(user);
  const isCurrentManager = currentRole === "manager";
  const isTargetAdmin = user.role === "admin";
  const isTargetManager = user.role === "manager";
  const canManageSanction =
    !isTargetAdmin && !(isCurrentManager && isTargetManager) && currentProfile?.id !== user.id;
  const sanctionOptions = isCurrentManager
    ? [{ value: "1", label: "1일" }, { value: "3", label: "3일" }, { value: "7", label: "7일" }]
    : [
        { value: "1", label: "1일" },
        { value: "3", label: "3일" },
        { value: "7", label: "7일" },
        { value: "30", label: "30일" },
        { value: "permanent", label: "영구" },
      ];

  const resetSanctionForm = () => {
    setSuspendDuration("1");
    setSuspendReason("");
    setSuspendInternalNote("");
  };

  const handleSave = () => {
    updateUser(
      { userId: user.id, updates: { role } },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  const handleCancel = () => {
    setRole(user.role === "admin" || user.role === "manager" ? user.role : "user");
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteUserMutate(user.id);
    setIsDeleteAlertOpen(false);
  };

  const handleSuspend = () => {
    const payload =
      suspendDuration === "permanent"
        ? {
            action: "suspend" as const,
            durationDays: null,
            reason: suspendReason,
            internalNote: suspendInternalNote,
          }
        : {
            action: "suspend" as const,
            durationDays: Number(suspendDuration),
            reason: suspendReason,
            internalNote: suspendInternalNote,
          };

    manageUserSanction(
      { userId: user.id, payload },
      {
        onSuccess: () => {
          setIsSuspendAlertOpen(false);
          resetSanctionForm();
        },
      }
    );
  };

  const handleUnsuspend = () => {
    manageUserSanction(
      {
        userId: user.id,
        payload: {
          action: "unsuspend",
          reason: "관리자 해제",
        },
      },
      {
        onSuccess: () => {
          setIsUnsuspendAlertOpen(false);
        },
      }
    );
  };

  const suspendedUntilText =
    user.suspended_until && effectiveStatus !== "active"
      ? new Date(user.suspended_until).toLocaleString("ko-KR")
      : "-";
  const visibleColumnCount = showSensitiveColumns ? 10 : 8;
  const nicknameDisplay = user.nickname
    ? user.nickname_code
      ? `${user.nickname} #${user.nickname_code}`
      : user.nickname
    : "-";

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
        <td className="px-4 py-3">
          <div className="flex gap-1">
            {canManageSanction ? (
              effectiveStatus === "active" ? (
                <IconTooltipButton
                  icon={UserLock}
                  label="정지"
                  onClick={() => setIsSuspendAlertOpen(true)}
                  buttonClassName="h-7 w-7 p-0 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
                  iconClassName="h-3.5 w-3.5"
                />
              ) : (
                <IconTooltipButton
                  icon={Check}
                  label="해제"
                  onClick={() => setIsUnsuspendAlertOpen(true)}
                  buttonClassName="h-7 w-7 p-0 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                  iconClassName="h-3.5 w-3.5"
                />
              )
            ) : null}
            <IconTooltipButton
              icon={TextSearch}
              label="이력 보기"
              onClick={() => setIsHistoryDialogOpen(true)}
              buttonClassName="h-7 w-7 p-0 text-slate-600 hover:bg-slate-100 hover:text-slate-700"
              iconClassName="h-3.5 w-3.5"
            />
            {isCurrentAdmin ? (
              <>
                <IconTooltipButton
                  icon={Pencil}
                  label={isEditing ? "닫기" : "유저관리"}
                  onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
                  buttonClassName="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
                  iconClassName="h-3.5 w-3.5"
                />
                <IconTooltipButton
                  icon={Trash2}
                  label="삭제"
                  onClick={() => setIsDeleteAlertOpen(true)}
                  disabled={isDeleting}
                  buttonClassName="h-7 w-7 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                  iconClassName="h-3.5 w-3.5"
                />
              </>
            ) : null}
          </div>
        </td>
        {showSensitiveColumns ? (
          <td className="px-4 py-3 text-sm text-gray-500 font-mono text-xs">
            {user.id.slice(0, 8)}...
          </td>
        ) : null}
        {showSensitiveColumns ? (
          <td className="px-4 py-3 text-sm text-gray-700">{user.email || "-"}</td>
        ) : null}
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
          <div className="flex flex-col">
            <span className="text-gray-700">{nicknameDisplay}</span>
            <span className="text-xs text-gray-400">
              코드: {user.nickname_code || "-"}
            </span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClassName(
              user.role
            )}`}
          >
            {user.role}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-gray-400">
          {new Date(user.created_at).toLocaleDateString("ko-KR")}
        </td>
        <td className="px-4 py-3 text-sm">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getAccountStatusBadgeClassName(
              effectiveStatus as AccountStatus
            )}`}
          >
            {getAccountStatusLabel(effectiveStatus as AccountStatus)}
          </span>
        </td>
        <td className="px-4 py-3 text-xs text-gray-500">
          {suspendedUntilText}
        </td>
        <td className="px-4 py-3 text-xs text-gray-500">
          {user.latest_sanction?.reason || "-"}
        </td>
      </tr>
      {isEditing ? (
        <tr className="border-b border-gray-100 bg-gray-50/70">
          <td colSpan={visibleColumnCount} className="px-4 py-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">유저관리</p>
                  <p className="text-xs text-gray-400">역할만 아래에서 수정할 수 있습니다.</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSave}
                    disabled={isPending}
                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancel}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">현재 닉네임</label>
                  <div className="flex h-9 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-600">
                    {nicknameDisplay}
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">역할</label>
                  <select
                    value={role}
                    onChange={(event) => setRole(event.target.value as AppRole)}
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </td>
        </tr>
      ) : null}

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

      <ConfirmAlert
        open={isSuspendAlertOpen}
        title="유저 정지"
        description="사유를 입력한 뒤 정지 기간을 선택해 주세요."
        confirmText="정지"
        cancelText="취소"
        isPending={isManagingSanction}
        confirmVariant="danger"
        confirmDisabled={!suspendReason.trim()}
        onConfirm={handleSuspend}
        onCancel={() => {
          setIsSuspendAlertOpen(false);
          resetSanctionForm();
        }}
      >
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">정지 기간</label>
            <select
              value={suspendDuration}
              onChange={(event) => setSuspendDuration(event.target.value)}
              className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm"
            >
              {sanctionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">사유</label>
            <textarea
              value={suspendReason}
              onChange={(event) => setSuspendReason(event.target.value)}
              rows={3}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
              placeholder="비매너, 비방, 욕설 등 정지 사유"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-600">내부 메모</label>
            <textarea
              value={suspendInternalNote}
              onChange={(event) => setSuspendInternalNote(event.target.value)}
              rows={2}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm outline-none focus:border-gray-400"
              placeholder="운영자 메모 (선택)"
            />
          </div>
        </div>
      </ConfirmAlert>

      <ConfirmAlert
        open={isUnsuspendAlertOpen}
        title="유저 정지 해제"
        description="이 유저의 정지를 해제하시겠습니까?"
        confirmText="해제"
        cancelText="취소"
        isPending={isManagingSanction}
        confirmVariant="default"
        onConfirm={handleUnsuspend}
        onCancel={() => setIsUnsuspendAlertOpen(false)}
      />

      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>제재 이력</DialogTitle>
            <DialogDescription>
              {user.nickname || user.email || user.id} 계정의 최근 제재 이력입니다.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[420px] overflow-y-auto rounded-lg border border-gray-100">
            {isSanctionsLoading ? (
              <div className="space-y-2 p-4">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : sanctions.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {sanctions.map((sanction, index) => (
                  <div key={`${sanction.created_at}-${index}`} className="space-y-1 p-4 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-gray-900">
                        {sanction.action_type === "unsuspend"
                          ? "해제"
                          : sanction.action_type === "ban"
                            ? "영구 정지"
                            : "일시 정지"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(sanction.created_at).toLocaleString("ko-KR")}
                      </span>
                    </div>
                    <p className="text-gray-700">사유: {sanction.reason}</p>
                    <p className="text-xs text-gray-500">
                      처리자: {sanction.created_by_name || sanction.created_by}
                      {sanction.created_by_role ? ` (${sanction.created_by_role})` : ""}
                    </p>
                    {sanction.suspended_until ? (
                      <p className="text-xs text-gray-500">
                        제한 종료: {new Date(sanction.suspended_until).toLocaleString("ko-KR")}
                      </p>
                    ) : null}
                    {sanction.internal_note ? (
                      <p className="text-xs text-gray-500">내부 메모: {sanction.internal_note}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-gray-400">
                제재 이력이 없습니다.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
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
  const [supporters, setSupporters] = useState(streamer.supporters || "");
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
          supporters: supporters.trim() || null,
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
    setSupporters(streamer.supporters || "");
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
          <div className="flex gap-1">
            <IconTooltipButton
              icon={Pencil}
              label={isEditing ? "닫기" : "수정"}
              onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
              buttonClassName="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
              iconClassName="h-3.5 w-3.5"
            />
            <IconTooltipButton
              icon={Trash2}
              label="삭제"
              onClick={() => setIsDeleteAlertOpen(true)}
              disabled={isDeleting}
              buttonClassName="h-7 w-7 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
              iconClassName="h-3.5 w-3.5"
            />
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-gray-700 font-medium">{streamer.nickname || "-"}</td>
        <td className="px-4 py-3 text-sm">
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-medium ${streamer.platform === "chzzk"
                ? "bg-green-100 text-green-700"
                : "bg-blue-100 text-blue-700"
              }`}
          >
            {streamer.platform}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-gray-500 text-xs font-mono">
          {streamer.chzzk_id ? `${streamer.chzzk_id.slice(0, 12)}...` : "-"}
        </td>
        <td className="px-4 py-3 text-sm text-gray-500">{streamer.soop_id || "-"}</td>
        <td className="px-4 py-3 text-sm text-gray-500">{streamer.group_name?.join(", ") || "-"}</td>
        <td className="px-4 py-3 text-sm text-gray-500">{streamer.crew_name?.join(", ") || "-"}</td>
        <td className="px-4 py-3 text-sm text-gray-500">{streamer.supporters || "-"}</td>
        <td className="px-4 py-3 text-sm text-gray-500">{streamer.birthday || "-"}</td>
        <td className="px-4 py-3 text-sm text-gray-500">{streamer.nationality || "-"}</td>
        <td className="px-4 py-3 text-sm text-gray-500">{streamer.gender || "-"}</td>
        <td className="px-4 py-3 text-sm text-gray-500">{streamer.genre?.join(", ") || "-"}</td>
        <td className="px-4 py-3 text-sm text-gray-500">
          {formatFirstStreamDate(streamer.first_stream_date)}
        </td>
        <td className="px-4 py-3 text-sm text-gray-500">{streamer.fandom_name || "-"}</td>
        <td className="px-4 py-3 text-sm text-gray-500">{streamer.mbti || "-"}</td>
        <td className="px-4 py-3 text-sm text-gray-500">{streamer.alias?.join(", ") || "-"}</td>
        <td className="px-4 py-3 text-sm">
          <TruncatedUrlDisplay url={streamer.platform_url} />
        </td>
        <td className="px-4 py-3 text-sm">
          <TruncatedUrlDisplay url={streamer.fancafe_url} />
        </td>
        <td className="px-4 py-3 text-sm">
          <TruncatedUrlDisplay url={streamer.youtube_url} />
        </td>
      </tr>
      {isEditing ? (
        <tr className="border-b border-gray-100 bg-gray-50/70">
          <td colSpan={19} className="px-4 py-4">
            <div className="max-w-6xl rounded-xl border border-gray-200 bg-white p-3 shadow-sm md:p-4">
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-900">버츄얼 관리</p>
                  <p className="text-xs text-gray-400">아래에서 버츄얼 정보를 수정할 수 있습니다.</p>
                </div>
                <div className="flex gap-1">
                  <IconTooltipButton
                    icon={Check}
                    label="저장"
                    onClick={handleSave}
                    disabled={isPending}
                    buttonClassName="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
                    iconClassName="h-4 w-4"
                  />
                  <IconTooltipButton
                    icon={X}
                    label="취소"
                    onClick={handleCancel}
                    buttonClassName="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                    iconClassName="h-4 w-4"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <AdminEditSection
                  title="기본 정보"
                  description="플랫폼과 식별자, 기본 소개 정보를 수정합니다."
                >
                  <AdminEditField label="닉네임">
                    <Input
                      value={nickname}
                      onChange={(event) => setNickname(event.target.value)}
                      className={STREAMER_EDIT_FIELD_CLASS_NAME}
                    />
                  </AdminEditField>
                  <AdminEditField label="플랫폼">
                    <select
                      value={platform}
                      onChange={(event) => setPlatform(event.target.value)}
                      className={`${STREAMER_EDIT_FIELD_CLASS_NAME} rounded-md border border-input bg-background px-3 text-sm`}
                    >
                      <option value="chzzk">chzzk</option>
                      <option value="soop">soop</option>
                    </select>
                  </AdminEditField>
                  <AdminEditField label="치지직 ID">
                    <Input
                      value={chzzkId}
                      onChange={(event) => setChzzkId(event.target.value)}
                      className={STREAMER_EDIT_FIELD_CLASS_NAME}
                    />
                  </AdminEditField>
                  <AdminEditField label="SOOP ID">
                    <Input
                      value={soopId}
                      onChange={(event) => setSoopId(event.target.value)}
                      className={STREAMER_EDIT_FIELD_CLASS_NAME}
                    />
                  </AdminEditField>
                  <AdminEditField label="이미지 URL">
                    <Input
                      value={imageUrl}
                      onChange={(event) => setImageUrl(event.target.value)}
                      className={STREAMER_EDIT_FIELD_CLASS_NAME}
                    />
                  </AdminEditField>
                  <AdminEditField label="서포터즈">
                    <Input
                      value={supporters}
                      onChange={(event) => setSupporters(event.target.value)}
                      className={STREAMER_EDIT_FIELD_CLASS_NAME}
                    />
                  </AdminEditField>
                </AdminEditSection>

                <AdminEditSection
                  title="소속 및 분류"
                  description="그룹/소속/장르/별명처럼 다중 값 항목은 쉼표로 구분합니다."
                >
                  <AdminEditField label="그룹명">
                    <Input
                      value={groupNameInput}
                      onChange={(event) => setGroupNameInput(event.target.value)}
                      className={STREAMER_EDIT_FIELD_CLASS_NAME}
                    />
                  </AdminEditField>
                  <AdminEditField label="소속명">
                    <Input
                      value={crewNameInput}
                      onChange={(event) => setCrewNameInput(event.target.value)}
                      className={STREAMER_EDIT_FIELD_CLASS_NAME}
                    />
                  </AdminEditField>
                  <AdminEditField label="장르">
                    <Input
                      value={genreInput}
                      onChange={(event) => setGenreInput(event.target.value)}
                      className={STREAMER_EDIT_FIELD_CLASS_NAME}
                    />
                  </AdminEditField>
                  <AdminEditField label="별명">
                    <Input
                      value={aliasInput}
                      onChange={(event) => setAliasInput(event.target.value)}
                      className={STREAMER_EDIT_FIELD_CLASS_NAME}
                    />
                  </AdminEditField>
                </AdminEditSection>

                <AdminEditSection
                  title="프로필 정보"
                  description="생일, 국적, 성별, 방송 관련 메타데이터를 관리합니다."
                >
                  <AdminEditField label="생일">
                    <Input
                      value={birthday}
                      onChange={(event) => setBirthday(event.target.value)}
                      className={STREAMER_EDIT_FIELD_CLASS_NAME}
                    />
                  </AdminEditField>
                  <AdminEditField label="국적">
                    <Input
                      value={nationality}
                      onChange={(event) => setNationality(event.target.value)}
                      className={STREAMER_EDIT_FIELD_CLASS_NAME}
                    />
                  </AdminEditField>
                  <AdminEditField label="성별">
                    <Input
                      value={gender}
                      onChange={(event) => setGender(event.target.value)}
                      className={STREAMER_EDIT_FIELD_CLASS_NAME}
                    />
                  </AdminEditField>
                  <AdminEditField label="첫 방송일">
                    <Input
                      value={firstStreamDate}
                      onChange={(event) => setFirstStreamDate(event.target.value)}
                      className={STREAMER_EDIT_FIELD_CLASS_NAME}
                    />
                  </AdminEditField>
                  <AdminEditField label="팬덤명">
                    <Input
                      value={fandomName}
                      onChange={(event) => setFandomName(event.target.value)}
                      className={STREAMER_EDIT_FIELD_CLASS_NAME}
                    />
                  </AdminEditField>
                  <AdminEditField label="MBTI">
                    <Input
                      value={mbti}
                      onChange={(event) => setMbti(event.target.value)}
                      className={STREAMER_EDIT_FIELD_CLASS_NAME}
                    />
                  </AdminEditField>
                </AdminEditSection>

                <AdminEditSection
                  title="외부 링크"
                  description="플랫폼, 팬카페, 유튜브 링크를 관리합니다."
                >
                  <AdminEditField label="플랫폼 주소">
                    <Input
                      value={platformUrl}
                      onChange={(event) => setPlatformUrl(event.target.value)}
                      className={STREAMER_EDIT_FIELD_CLASS_NAME}
                    />
                  </AdminEditField>
                  <AdminEditField label="팬카페 주소">
                    <Input
                      value={fancafeUrl}
                      onChange={(event) => setFancafeUrl(event.target.value)}
                      className={STREAMER_EDIT_FIELD_CLASS_NAME}
                    />
                  </AdminEditField>
                  <AdminEditField label="유튜브 주소">
                    <Input
                      value={youtubeUrl}
                      onChange={(event) => setYoutubeUrl(event.target.value)}
                      className={STREAMER_EDIT_FIELD_CLASS_NAME}
                    />
                  </AdminEditField>
                </AdminEditSection>
              </div>
            </div>
          </td>
        </tr>
      ) : null}

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
  users?: AdminUserProfile[];
  isLoading: boolean;
};

export function UserTable({ users, isLoading }: UserTableProps) {
  const { profile } = useAuthStore();
  const showSensitiveColumns = profile?.role !== "manager";
  const columnCount = showSensitiveColumns ? 10 : 8;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto overflow-y-auto max-h-[560px]">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-gray-50/80 border-b border-gray-100">
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-32">유저관리</th>
            {showSensitiveColumns ? (
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
            ) : null}
            {showSensitiveColumns ? (
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">이메일</th>
            ) : null}
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">가입 방식</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">닉네임 / 코드</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">역할</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">가입일</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">상태</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">제한 종료</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">최근 제재 사유</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <TableSkeleton cols={columnCount} />
          ) : users && users.length > 0 ? (
            users.map((user) => <UserRow key={user.id} user={user} />)
          ) : (
            <tr>
              <td colSpan={columnCount} className="px-4 py-12 text-center text-gray-400 text-sm">
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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto overflow-y-auto max-h-[620px]">
      <table className="min-w-[2820px] text-left">
        <thead>
          <tr className="bg-gray-50/80 border-b border-gray-100">
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-20">관리</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">닉네임</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">플랫폼</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">치지직 ID</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">SOOP ID</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">그룹명(text[])</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">소속명(text[])</th>
            <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">서포터즈</th>
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
