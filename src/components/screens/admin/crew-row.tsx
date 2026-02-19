"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import ConfirmAlert from "@/components/common/confirm-alert";
import { useUpdateCrew } from "@/hooks/mutations/admin/use-update-crew";
import { useDeleteCrew } from "@/hooks/mutations/admin/use-delete-crew";
import { uploadCrewImage } from "@/api/admin-crews";
import type { Crew, CrewUpsertInput } from "@/types/crew";
import { Pencil, Check, X, Trash2 } from "lucide-react";
import { toast } from "sonner";
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
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [form, setForm] = useState<CrewUpsertInput>({
        crew_code: crew.crew_code,
        name: crew.name,
        leader: crew.leader,
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
            ? valueString.trim() || null
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
        setIsUploadingImage(true);
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
        } finally {
            setIsUploadingImage(false);
        }
    };

    return (
        <>
            <tr className="border-b border-gray-100 align-top">
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
                <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
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
                        <CrewFormFields
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
                title="크루 삭제"
                description="정말 이 크루를 삭제하시겠습니까?"
                confirmText="삭제"
                cancelText="취소"
                isPending={isDeleting}
                onConfirm={handleDelete}
                onCancel={() => setIsDeleteAlertOpen(false)}
            />
        </>
    );
}
