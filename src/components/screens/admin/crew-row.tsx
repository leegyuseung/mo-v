"use client";

import { useState } from "react";
import ConfirmAlert from "@/components/common/confirm-alert";
import { useUpdateCrew } from "@/hooks/mutations/admin/use-update-crew";
import { useDeleteCrew } from "@/hooks/mutations/admin/use-delete-crew";
import { useUploadCrewImage } from "@/hooks/mutations/admin/use-upload-crew-image";
import type { Crew, CrewUpsertInput } from "@/types/crew";
import { Pencil, Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
import IconTooltipButton from "@/components/common/icon-tooltip-button";
import CrewFormFields from "./crew-form-fields";

/** 크루 테이블의 개별 행 — 인라인 수정 및 삭제 기능 포함 */
export default function CrewRow({
    crew,
    matchedMembers,
}: {
    crew: Crew;
    matchedMembers: string[];
}) {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [memberEtcInput, setMemberEtcInput] = useState(
        crew.member_etc?.join(", ") || ""
    );
    const [form, setForm] = useState<CrewUpsertInput>({
        crew_code: crew.crew_code,
        name: crew.name,
        leader: crew.leader,
        member_etc: crew.member_etc,
        fandom_name: crew.fandom_name,
        debut_at: crew.debut_at,
        fancafe_url: crew.fancafe_url,
        youtube_url: crew.youtube_url,
        soop_url: crew.soop_url,
        chzzk_url: crew.chzzk_url,
        image_url: crew.image_url,
        bg_color: crew.bg_color,
    });

    const { mutate: updateCrew, isPending: isUpdating } = useUpdateCrew();
    const { mutate: deleteCrew, isPending: isDeleting } = useDeleteCrew();
    const { mutateAsync: uploadCrewImage, isPending: isUploadingImage } =
        useUploadCrewImage();

    const setField = (
        key: keyof CrewUpsertInput,
        rawValue: string | boolean | null
    ) => {
        if (key === "bg_color") {
            setForm((prev) => ({ ...prev, bg_color: rawValue ? "true" : null }));
            return;
        }
        const valueString = typeof rawValue === "string" ? rawValue : "";
        const nullableKeys: Array<keyof CrewUpsertInput> = [
            "leader",
            "fandom_name",
            "debut_at",
            "fancafe_url",
            "youtube_url",
            "soop_url",
            "chzzk_url",
            "image_url",
        ];

        const value = nullableKeys.includes(key)
            ? valueString || null
            : valueString;

        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        if (!form.crew_code.trim() || !form.name.trim()) {
            toast.error("식별코드와 이름은 필수입니다.");
            return;
        }

        updateCrew(
            {
                crewId: crew.id,
                payload: {
                    ...form,
                    member_etc: (() => {
                        const parsed = memberEtcInput
                            .split(",")
                            .map((value) => value.trim())
                            .filter(Boolean);
                        return parsed.length > 0 ? parsed : null;
                    })(),
                    crew_code: form.crew_code.trim(),
                    name: form.name.trim(),
                },
            },
            {
                onSuccess: () => setIsEditing(false),
            }
        );
    };

    const handleDelete = () => {
        deleteCrew(crew.id, {
            onSuccess: () => setIsDeleteAlertOpen(false),
        });
    };

    const handleUploadImage = async (file: File | null) => {
        if (!file) return;
        try {
            const publicUrl = await uploadCrewImage(file);
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
                    {crew.name}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {crew.crew_code}
                </td>
                <td
                    className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap max-w-[280px] truncate"
                    title={matchedMembers.join(", ") || "-"}
                >
                    {matchedMembers.join(", ") || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {crew.leader || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {crew.fandom_name || "-"}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {crew.debut_at || "-"}
                </td>
            </tr>

            {isEditing ? (
                <tr className="border-b border-gray-100 bg-gray-50/60">
                    <td colSpan={7} className="px-4 py-3">
                        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="mb-3 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">소속 관리</p>
                                    <p className="text-xs text-gray-400">
                                        아래에서 소속 정보를 수정할 수 있습니다.
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
                            <CrewFormFields
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
                title="소속 삭제"
                description="정말 이 소속을 삭제하시겠습니까?"
                confirmText="삭제"
                cancelText="취소"
                isPending={isDeleting}
                onConfirm={handleDelete}
                onCancel={() => setIsDeleteAlertOpen(false)}
            />
        </>
    );
}
