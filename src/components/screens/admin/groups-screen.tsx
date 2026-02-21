"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useIdolGroups } from "@/hooks/queries/admin/use-idol-groups";
import { useStreamers } from "@/hooks/queries/admin/use-streamers";
import { useCreateIdolGroup } from "@/hooks/mutations/admin/use-create-idol-group";
import { uploadIdolGroupImage } from "@/api/admin-groups";
import type { IdolGroupUpsertInput } from "@/types/group";
import { UsersRound } from "lucide-react";
import { toast } from "sonner";
import GroupFormFields from "./group-form-fields";
import GroupRow from "./group-row";

/** 관리자 그룹 관리 화면 — 그룹 목록, 추가, 멤버 자동 매칭 */
export default function GroupsScreen() {
  const { data: groups, isLoading } = useIdolGroups();
  const { data: streamers } = useStreamers();
  const { mutate: createGroup, isPending: isCreating } = useCreateIdolGroup();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [memberEtcInput, setMemberEtcInput] = useState("");
  const [form, setForm] = useState<IdolGroupUpsertInput>({
    group_code: "",
    name: "",
    leader: null,
    member_etc: null,
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
      ? valueString || null
      : valueString;

    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm({
      group_code: "",
      name: "",
      leader: null,
      member_etc: null,
      fandom_name: null,
      agency: null,
      formed_at: null,
      debut_at: null,
      fancafe_url: null,
      youtube_url: null,
      image_url: null,
      bg_color: null,
    });
    setMemberEtcInput("");
  };

  const handleCreate = () => {
    if (!form.group_code.trim() || !form.name.trim()) {
      toast.error("식별코드와 이름은 필수입니다.");
      return;
    }

    createGroup(
      {
        ...form,
        member_etc: (() => {
          const parsed = memberEtcInput
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean);
          return parsed.length > 0 ? parsed : null;
        })(),
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

  /** group_code 기반으로 스트리머 닉네임을 그룹별로 매핑 */
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
            memberEtcValue={memberEtcInput}
            onChange={setField}
            onChangeMemberEtc={setMemberEtcInput}
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
        <table className="w-full min-w-[980px] text-left whitespace-nowrap">
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
