"use client";

import { useState } from "react";
import ConfirmAlert from "@/components/common/confirm-alert";
import { useUpdateIdolGroup } from "@/hooks/mutations/admin/use-update-idol-group";
import { useDeleteIdolGroup } from "@/hooks/mutations/admin/use-delete-idol-group";
import { useUploadIdolGroupImage } from "@/hooks/mutations/admin/use-upload-idol-group-image";
import type { IdolGroupUpsertInput, GroupRowProps } from "@/types/group";
import { Pencil, Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import IconTooltipButton from "@/components/common/icon-tooltip-button";
import GroupFormFields from "./group-form-fields";

/** 그룹 테이블의 개별 행 — 인라인 수정 및 삭제 기능 포함 */
export default function GroupRow({
    group,
    matchedMembers,
}: GroupRowProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [memberEtcInput, setMemberEtcInput] = useState(
        group.member_etc?.join(", ") || ""
    );
    const [form, setForm] = useState<IdolGroupUpsertInput>({
        group_code: group.group_code,
        name: group.name,
        leader: group.leader,
        member_etc: group.member_etc,
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
    const { mutateAsync: uploadIdolGroupImage, isPending: isUploadingImage } =
        useUploadIdolGroupImage();

    /**
     * 폼 필드 값 변경 핸들러 (nullable 필드 자동 변환).
     * 빈 문자열을 null로 변환하여 DB에 저장 시 일관성을 유지한다.
     */
    const setField = (
        key: keyof IdolGroupUpsertInput,
        rawValue: string | boolean | null
    ) => {
        // bg_color는 boolean을 "true" 문자열 또는 null로 변환 (특수 처리)
        if (key === "bg_color") {
            setForm((prev) => ({ ...prev, bg_color: rawValue ? "true" : null }));
            return;
        }

        // 입력값을 문자열로 정규화
        const valueString = typeof rawValue === "string" ? rawValue : "";

        // null 허용 필드 목록 정의
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

        // nullable 필드는 빈 문자열을 null로 변환, 필수 필드는 빈 문자열 유지
        const value = nullableKeys.includes(key)
            ? valueString || null
            : valueString;

        setForm((prev) => ({ ...prev, [key]: value }));
    };

    /** 저장 버튼 핸들러 — 필수값 검증 후 mutation 실행 */
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
            },
            {
                onSuccess: () => setIsEditing(false),
            }
        );
    };

    /** 삭제 처리 핸들러 */
    const handleDelete = () => {
        deleteGroup(group.id, {
            onSuccess: () => setIsDeleteAlertOpen(false),
        });
    };

    /** 대표 이미지 업로드 핸들러 */
    const handleUploadImage = async (file: File | null) => {
        if (!file) return;
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
        }
    };

    return (
        <>
            <tr className="border-b border-gray-100 align-top">
                <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    <div className="flex gap-1">
                        <IconTooltipButton
                            icon={Pencil}
                            label={isEditing ? "닫기" : "수정"}
                            onClick={() => setIsEditing((prev) => !prev)}
                            buttonClassName="h-7 w-7 p-0 text-gray-400 hover:text-gray-600"
                            iconClassName="h-3.5 w-3.5"
                        />
                        <IconTooltipButton
                            icon={Trash2}
                            label="삭제"
                            onClick={() => setIsDeleteAlertOpen(true)}
                            buttonClassName="h-7 w-7 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                            iconClassName="h-3.5 w-3.5"
                        />
                    </div>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-800 whitespace-nowrap">
                    {group.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {group.group_code}
                </td>
                <td
                    className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap max-w-[280px] truncate"
                    title={matchedMembers.join(", ") || "-"}
                >
                    {matchedMembers.join(", ") || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {group.leader || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {group.fandom_name || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {group.agency || "-"}
                </td>
            </tr>

            {isEditing ? (
                <tr className="border-b border-gray-100 bg-gray-50/60">
                    <td colSpan={7} className="px-4 py-3">
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="mb-3 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">그룹 관리</p>
                                    <p className="text-xs text-gray-400">
                                        아래에서 그룹 정보를 수정할 수 있습니다.
                                    </p>
                                </div>
                                <div className="flex gap-1">
                                    <IconTooltipButton
                                        icon={Check}
                                        label="저장"
                                        onClick={handleSave}
                                        disabled={isUpdating}
                                        buttonClassName="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
                                        iconClassName="h-4 w-4"
                                    />
                                    <IconTooltipButton
                                        icon={X}
                                        label="취소"
                                        onClick={() => setIsEditing(false)}
                                        buttonClassName="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                                        iconClassName="h-4 w-4"
                                    />
                                </div>
                            </div>
                            <GroupFormFields
                                form={form}
                                memberEtcValue={memberEtcInput}
                                onChange={setField}
                                onChangeMemberEtc={setMemberEtcInput}
                                onUploadImage={handleUploadImage}
                                isUploadingImage={isUploadingImage}
                            />
                            <div className="mt-4 space-y-1">
                                <label className="text-xs font-medium text-gray-500">매칭 멤버</label>
                                <div className="flex min-h-10 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-600">
                                    {matchedMembers.length > 0 ? matchedMembers.join(", ") : "-"}
                                </div>
                            </div>
                        </div>
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
