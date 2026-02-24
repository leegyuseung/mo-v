import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Camera, UserRound, X } from "lucide-react";
import type { ChangeEvent, RefObject } from "react";

type ProfileAvatarSectionProps = {
  profileAvatarUrl: string | null;
  avatarPreview: string | null;
  avatarFile: File | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onAvatarClick: () => void;
  onAvatarChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onRemoveAvatar: () => void;
};

/** 프로필 아바타 업로드 섹션 */
export default function ProfileAvatarSection({
  profileAvatarUrl,
  avatarPreview,
  avatarFile,
  fileInputRef,
  onAvatarClick,
  onAvatarChange,
  onRemoveAvatar,
}: ProfileAvatarSectionProps) {
  return (
    <div className="bg-gray-50 rounded-2xl p-6">
      <Label className="text-sm font-semibold text-gray-700 mb-4 block">프로필 사진</Label>
      <div className="flex items-center gap-6">
        <div className="relative group">
          <Avatar className="h-28 w-28 ring-4 ring-white shadow-lg">
            {avatarPreview ? (
              <AvatarImage src={avatarPreview} alt="프로필 미리보기" />
            ) : profileAvatarUrl ? (
              <AvatarImage src={profileAvatarUrl} alt="프로필 사진" />
            ) : (
              <AvatarFallback className="bg-white border border-gray-100">
                <UserRound className="w-12 h-12 text-gray-300" />
              </AvatarFallback>
            )}
          </Avatar>

          <button
            type="button"
            onClick={onAvatarClick}
            className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            <Camera className="w-7 h-7 text-white" />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs text-gray-500">JPG, PNG, GIF (최대 5MB)</p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAvatarClick}
              className="text-xs"
            >
              <Camera className="w-3.5 h-3.5 mr-1.5" />
              사진 변경
            </Button>
            {avatarFile ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemoveAvatar}
                className="text-xs text-red-500 hover:text-red-600"
              >
                <X className="w-3.5 h-3.5 mr-1" />
                취소
              </Button>
            ) : null}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onAvatarChange}
        />
      </div>
    </div>
  );
}
