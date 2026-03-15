import { updateProfile, uploadAvatar } from "@/api/profile";
import { addHeartPoints } from "@/api/heart";
import { useAuthStore } from "@/store/useAuthStore";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import type { UpdateProfileInput } from "@/types/profile";

export function useUpdateProfile() {
    const { setProfile, setHeartPoints } = useAuthStore();

    return useMutation({
        mutationFn: async ({
            userId,
            nickname,
            bio,
            avatarFile,
            isFirstEdit,
        }: UpdateProfileInput) => {
            let avatar_url: string | undefined;

            // 아바타 파일이 있으면 먼저 업로드
            if (avatarFile) {
                avatar_url = await uploadAvatar(userId, avatarFile);
            }

            // 프로필 업데이트
            const profile = await updateProfile(userId, {
                nickname,
                bio,
                ...(avatar_url !== undefined ? { avatar_url } : {}),
                ...(isFirstEdit ? { is_first_edit: false } : {}),
            });

            // 처음 프로필 수정 시 50 하트포인트 지급
            let heartPoints = null;
            if (isFirstEdit) {
                heartPoints = await addHeartPoints(userId, 50, "profile_first_edit", "첫 프로필 수정 보너스");
            }

            return { profile, heartPoints };
        },
        onSuccess: ({ profile, heartPoints }) => {
            setProfile(profile);
            if (heartPoints) {
                setHeartPoints(heartPoints);
                toast.success("🎉 첫 프로필 수정 완료! 50 하트포인트가 지급되었습니다.");
            } else {
                toast.success("프로필이 수정되었습니다.");
            }
        },
        onError: (error) => {
            console.error("프로필 수정 실패:", error);
            const message =
                error instanceof Error
                    ? error.message
                    : "프로필 수정에 실패했습니다. 다시 시도해주세요.";
            toast.error(message);
        },
    });
}
