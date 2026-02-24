import { useMutation } from "@tanstack/react-query";
import { uploadCrewImage } from "@/api/admin-crews";

/** 관리자 소속 대표 이미지 업로드 mutation 훅 */
export function useUploadCrewImage() {
  return useMutation({
    mutationFn: (file: File) => uploadCrewImage(file),
  });
}
