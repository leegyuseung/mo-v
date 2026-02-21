"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CrewUpsertInput } from "@/types/crew";

/** 크루 추가/수정 시 사용하는 폼 필드 컴포넌트 */
export default function CrewFormFields({
    form,
    memberEtcValue,
    onChange,
    onChangeMemberEtc,
    onUploadImage,
    isUploadingImage,
}: {
    form: CrewUpsertInput;
    memberEtcValue: string;
    onChange: (
        key: keyof CrewUpsertInput,
        value: string | boolean | null
    ) => void;
    onChangeMemberEtc: (value: string) => void;
    onUploadImage: (file: File | null) => void;
    isUploadingImage: boolean;
}) {
    return (
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <Input
                value={form.crew_code}
                onChange={(e) => onChange("crew_code", e.target.value)}
                placeholder="식별코드 (예: woowakgood-crew)"
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
                value={memberEtcValue}
                onChange={(e) => onChangeMemberEtc(e.target.value)}
                placeholder="기타 멤버 (쉼표로 구분)"
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
                value={form.soop_url || ""}
                onChange={(e) => onChange("soop_url", e.target.value)}
                placeholder="SOOP URL"
                className="h-9"
            />
            <Input
                value={form.chzzk_url || ""}
                onChange={(e) => onChange("chzzk_url", e.target.value)}
                placeholder="치지직 URL"
                className="h-9"
            />
            <Input
                value={form.image_url || ""}
                onChange={(e) => onChange("image_url", e.target.value)}
                placeholder="대표이미지 URL"
                className="h-9"
            />
            <div className="md:col-span-2 flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2">
                <div>
                    <p className="text-sm font-medium text-gray-700">대표 이미지 배경색</p>
                    <p className="text-xs text-gray-500">
                        ON이면 크루 이미지 배경을 검정색으로 표시합니다.
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
