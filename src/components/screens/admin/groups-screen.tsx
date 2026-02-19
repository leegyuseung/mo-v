"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import ConfirmAlert from "@/components/common/confirm-alert";
import { useIdolGroups } from "@/hooks/queries/admin/use-idol-groups";
import { useStreamers } from "@/hooks/queries/admin/use-streamers";
import { useCreateIdolGroup } from "@/hooks/mutations/admin/use-create-idol-group";
import { useUpdateIdolGroup } from "@/hooks/mutations/admin/use-update-idol-group";
import { useDeleteIdolGroup } from "@/hooks/mutations/admin/use-delete-idol-group";
import { uploadIdolGroupImage } from "@/api/admin-groups";
import type { IdolGroupUpsertInput } from "@/types/admin";
import type { IdolGroup } from "@/types/group";
import { Pencil, Check, X, Trash2, UsersRound } from "lucide-react";
import { toast } from "sonner";

function GroupFormFields({
  form,
  onChange,
  onUploadImage,
  isUploadingImage,
}: {
  form: IdolGroupUpsertInput;
  onChange: (
    key: keyof IdolGroupUpsertInput,
    value: string | boolean | null
  ) => void;
  onUploadImage: (file: File | null) => void;
  isUploadingImage: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
      <Input
        value={form.group_code}
        onChange={(e) => onChange("group_code", e.target.value)}
        placeholder="식별코드 (예: isedol)"
        className="h-9"
      />
      <Input
        value={form.name}
        onChange={(e) => onChange("name", e.target.value)}
        placeholder="이름"
        className="h-9"
      />
      <Input
        value={form.leader || ""}
        onChange={(e) => onChange("leader", e.target.value)}
        placeholder="리더"
        className="h-9"
      />
      <Input
        value={form.fandom_name || ""}
        onChange={(e) => onChange("fandom_name", e.target.value)}
        placeholder="팬덤명"
        className="h-9"
      />
      <Input
        value={form.agency || ""}
        onChange={(e) => onChange("agency", e.target.value)}
        placeholder="소속"
        className="h-9"
      />
      <Input
        value={form.formed_at || ""}
        onChange={(e) => onChange("formed_at", e.target.value)}
        placeholder="결성일"
        className="h-9"
      />
      <Input
        value={form.debut_at || ""}
        onChange={(e) => onChange("debut_at", e.target.value)}
        placeholder="데뷔일"
        className="h-9"
      />
      <Input
        value={form.fancafe_url || ""}
        onChange={(e) => onChange("fancafe_url", e.target.value)}
        placeholder="팬카페 URL"
        className="h-9"
      />
      <Input
        value={form.youtube_url || ""}
        onChange={(e) => onChange("youtube_url", e.target.value)}
        placeholder="유튜브 URL"
        className="h-9"
      />
      <Input
        value={form.image_url || ""}
        onChange={(e) => onChange("image_url", e.target.value)}
        placeholder="대표이미지 URL"
        className="h-9 md:col-span-2"
      />
      <div className="md:col-span-2 flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
        <div>
          <p className="text-sm font-medium text-gray-700">대표 이미지 배경색</p>
          <p className="text-xs text-gray-500">
            ON이면 그룹 이미지 배경을 와인색으로 표시합니다.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant={form.bg_color ? "default" : "outline"}
          onClick={() => onChange("bg_color", !form.bg_color)}
          className={`cursor-pointer ${form.bg_color ? "bg-rose-900 hover:bg-rose-950 text-white" : ""
            }`}
        >
          {form.bg_color ? "ON" : "OFF"}
        </Button>
      </div>
      <div className="md:col-span-2">
        <Input
          type="file"
          accept="image/*"
          onChange={(e) => {
            onUploadImage(e.target.files?.[0] || null);
            e.currentTarget.value = "";
          }}
          className="h-9 cursor-pointer"
          disabled={isUploadingImage}
        />
        <p className="mt-1 text-xs text-gray-500">
          {isUploadingImage
            ? "대표이미지를 업로드하는 중입니다..."
            : "파일 선택 시 업로드 후 대표이미지 URL에 자동 입력됩니다."}
        </p>
      </div>
    </div>
  );
}

function GroupRow({
  group,
  matchedMembers,
}: {
  group: IdolGroup;
  matchedMembers: string[];
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [form, setForm] = useState<IdolGroupUpsertInput>({
    group_code: group.group_code,
    name: group.name,
    leader: group.leader,
    fandom_name: group.fandom_name,
    agency: group.agency,
    formed_at: group.formed_at,
    debut_at: group.debut_at,
    fancafe_url: group.fancafe_url,
    youtube_url: group.youtube_url,
    image_url: group.image_url,
    bg_color: group.bg_color,
  });

  const { mutate: updateGroup, isPending: isUpdating } = useUpdateIdolGroup();
  const { mutate: deleteGroup, isPending: isDeleting } = useDeleteIdolGroup();

  const setField = (
    key: keyof IdolGroupUpsertInput,
    rawValue: string | boolean | null
  ) => {
    if (key === "bg_color") {
      setForm((prev) => ({ ...prev, bg_color: rawValue ? "true" : null }));
      return;
    }

    const valueString = typeof rawValue === "string" ? rawValue : "";
    const nullableKeys: Array<keyof IdolGroupUpsertInput> = [
      "leader",
      "fandom_name",
      "agency",
      "formed_at",
      "debut_at",
      "fancafe_url",
      "youtube_url",
      "image_url",
    ];

    const value = nullableKeys.includes(key)
      ? valueString.trim() || null
      : valueString;

    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!form.group_code.trim() || !form.name.trim()) {
      toast.error("식별코드와 이름은 필수입니다.");
      return;
    }

    updateGroup(
      {
        groupId: group.id,
        payload: {
          ...form,
          group_code: form.group_code.trim(),
          name: form.name.trim(),
        },
      },
      {
        onSuccess: () => setIsEditing(false),
      }
    );
  };

  const handleDelete = () => {
    deleteGroup(group.id, {
      onSuccess: () => setIsDeleteAlertOpen(false),
    });
  };

  const handleUploadImage = async (file: File | null) => {
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const publicUrl = await uploadIdolGroupImage(file);
      setForm((prev) => ({ ...prev, image_url: publicUrl }));
      toast.success("대표이미지를 업로드했습니다.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "대표이미지 업로드 중 오류가 발생했습니다."
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  return (
    <>
      <tr className="border-b border-gray-100 align-top">
        <td className="px-4 py-3 text-sm font-medium text-gray-800">{group.name}</td>
        <td className="px-4 py-3 text-sm text-gray-500">{group.group_code}</td>
        <td className="px-4 py-3 text-sm text-gray-500">
          {matchedMembers.join(", ") || "-"}
        </td>
        <td className="px-4 py-3 text-sm text-gray-500">{group.leader || "-"}</td>
        <td className="px-4 py-3 text-sm text-gray-500">{group.fandom_name || "-"}</td>
        <td className="px-4 py-3 text-sm text-gray-500">{group.agency || "-"}</td>
        <td className="px-4 py-3 text-sm text-gray-500">
          <div className="flex gap-1">
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSave}
                  disabled={isUpdating}
                  className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(false)}
                  className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
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
                  className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </>
            )}
          </div>
        </td>
      </tr>

      {isEditing ? (
        <tr className="border-b border-gray-100 bg-gray-50/60">
          <td colSpan={7} className="px-4 py-3">
            <GroupFormFields
              form={form}
              onChange={setField}
              onUploadImage={handleUploadImage}
              isUploadingImage={isUploadingImage}
            />
          </td>
        </tr>
      ) : null}

      <ConfirmAlert
        open={isDeleteAlertOpen}
        title="그룹 삭제"
        description="정말 이 그룹을 삭제하시겠습니까?"
        confirmText="삭제"
        cancelText="취소"
        isPending={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteAlertOpen(false)}
      />
    </>
  );
}

export default function GroupsScreen() {
  const { data: groups, isLoading } = useIdolGroups();
  const { data: streamers } = useStreamers();
  const { mutate: createGroup, isPending: isCreating } = useCreateIdolGroup();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [form, setForm] = useState<IdolGroupUpsertInput>({
    group_code: "",
    name: "",
    leader: null,
    fandom_name: null,
    agency: null,
    formed_at: null,
    debut_at: null,
    fancafe_url: null,
    youtube_url: null,
    image_url: null,
    bg_color: null,
  });

  const setField = (
    key: keyof IdolGroupUpsertInput,
    rawValue: string | boolean | null
  ) => {
    if (key === "bg_color") {
      setForm((prev) => ({ ...prev, bg_color: rawValue ? "true" : null }));
      return;
    }

    const valueString = typeof rawValue === "string" ? rawValue : "";
    const nullableKeys: Array<keyof IdolGroupUpsertInput> = [
      "leader",
      "fandom_name",
      "agency",
      "formed_at",
      "debut_at",
      "fancafe_url",
      "youtube_url",
      "image_url",
    ];

    const value = nullableKeys.includes(key)
      ? valueString.trim() || null
      : valueString;

    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm({
      group_code: "",
      name: "",
      leader: null,
      fandom_name: null,
      agency: null,
      formed_at: null,
      debut_at: null,
      fancafe_url: null,
      youtube_url: null,
      image_url: null,
      bg_color: null,
    });
  };

  const handleCreate = () => {
    if (!form.group_code.trim() || !form.name.trim()) {
      toast.error("식별코드와 이름은 필수입니다.");
      return;
    }

    createGroup(
      {
        ...form,
        group_code: form.group_code.trim(),
        name: form.name.trim(),
      },
      {
        onSuccess: () => {
          resetForm();
          setIsAddOpen(false);
        },
      }
    );
  };

  const handleUploadImage = async (file: File | null) => {
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const publicUrl = await uploadIdolGroupImage(file);
      setForm((prev) => ({ ...prev, image_url: publicUrl }));
      toast.success("대표이미지를 업로드했습니다.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "대표이미지 업로드 중 오류가 발생했습니다."
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const membersByGroupCode = useMemo(() => {
    const map: Record<string, string[]> = {};
    if (!groups || !streamers) return map;

    groups.forEach((group) => {
      map[group.group_code.trim().toLowerCase()] = [];
    });

    streamers.forEach((streamer) => {
      const nickname = (streamer.nickname || "").trim();
      if (!nickname) return;

      const matchedCodes = new Set<string>();
      const candidateCodes = [
        ...(streamer.group_codes || []),
        ...(streamer.group_name || []),
      ];

      candidateCodes.forEach((value) => {
        const normalized = (value || "").trim().toLowerCase();
        if (normalized && map[normalized]) {
          matchedCodes.add(normalized);
        }
      });

      matchedCodes.forEach((code) => {
        if (!map[code].includes(nickname)) {
          map[code].push(nickname);
        }
      });
    });

    return map;
  }, [groups, streamers]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <UsersRound className="w-5 h-5 text-indigo-500" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">그룹 관리</h1>
            <p className="text-sm text-gray-500">
              그룹 정보 CRUD 및 버츄얼 그룹코드 기반 멤버 자동 매칭
            </p>
          </div>
        </div>
        <Button
          type="button"
          onClick={() => setIsAddOpen((prev) => !prev)}
          className="cursor-pointer bg-gray-800 hover:bg-gray-900 text-white"
        >
          {isAddOpen ? "추가 닫기" : "그룹 추가"}
        </Button>
      </div>

      {isAddOpen ? (
        <div className="mb-4 rounded-2xl border border-gray-100 bg-white p-4">
          <GroupFormFields
            form={form}
            onChange={setField}
            onUploadImage={handleUploadImage}
            isUploadingImage={isUploadingImage}
          />
          <div className="mt-3 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                setIsAddOpen(false);
              }}
              className="cursor-pointer"
            >
              취소
            </Button>
            <Button
              type="button"
              onClick={handleCreate}
              disabled={isCreating}
              className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isCreating ? "추가중..." : "저장"}
            </Button>
          </div>
        </div>
      ) : null}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full min-w-[980px] text-left">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-100">
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">이름</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">식별코드</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">멤버</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">리더</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">팬덤명</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">소속</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase w-24">수정</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <tr key={i} className="border-b border-gray-100">
                  <td className="px-4 py-3" colSpan={7}>
                    <Skeleton className="h-5 w-full" />
                  </td>
                </tr>
              ))
            ) : groups && groups.length > 0 ? (
              groups.map((group) => (
                <GroupRow
                  key={group.id}
                  group={group}
                  matchedMembers={
                    membersByGroupCode[group.group_code.trim().toLowerCase()] || []
                  }
                />
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">
                  등록된 그룹이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
