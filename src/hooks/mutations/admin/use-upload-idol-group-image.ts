import { useMutation } from "@tanstack/react-query";
import { uploadIdolGroupImage } from "@/api/admin-groups";

/** 관리자 그룹 대표 이미지 업로드 mutation 훅 */
export function useUploadIdolGroupImage() {
  return useMutation({
    mutationFn: (file: File) => uploadIdolGroupImage(file),
  });
}
