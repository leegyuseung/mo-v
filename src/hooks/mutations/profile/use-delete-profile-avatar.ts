import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { removeAvatar, updateProfile } from "@/api/profile";
import { useAuthStore } from "@/store/useAuthStore";

type DeleteProfileAvatarInput = {
  userId: string;
  currentAvatarUrl: string | null;
};

export function useDeleteProfileAvatar() {
  const { setProfile } = useAuthStore();

  return useMutation({
    mutationFn: async ({ userId, currentAvatarUrl }: DeleteProfileAvatarInput) => {
      await removeAvatar(currentAvatarUrl);
      return updateProfile(userId, {
        avatar_url: null,
      });
    },
    onSuccess: (profile) => {
      setProfile(profile);
      toast.success("프로필 사진이 삭제되었습니다.");
    },
    onError: (error) => {
      console.error("프로필 사진 삭제 실패:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "프로필 사진 삭제에 실패했습니다."
      );
    },
  });
}
