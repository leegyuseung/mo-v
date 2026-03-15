import { useCallback, useRef, useState } from "react";
import type { ChangeEvent } from "react";

/** 프로필 아바타 업로드 상태/핸들러를 캡슐화한다. */
export function useAvatarUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const handleAvatarClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleAvatarChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하만 가능합니다.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setAvatarPreview(loadEvent.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleRemoveAvatar = useCallback(() => {
    setAvatarPreview(null);
    setAvatarFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const resetAvatarState = useCallback(() => {
    setAvatarPreview(null);
    setAvatarFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return {
    fileInputRef,
    avatarPreview,
    avatarFile,
    handleAvatarClick,
    handleAvatarChange,
    handleRemoveAvatar,
    resetAvatarState,
  };
}
