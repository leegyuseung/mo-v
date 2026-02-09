import { signOut } from "@/api/auth";
import { useMutationCallback } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export function useSignOut(callbacks?: useMutationCallback) {
    const router = useRouter();
    const { clearSession } = useAuthStore();

    return useMutation({
        mutationFn: signOut,
        onSuccess: () => {
            clearSession();
            router.replace("/login");
            if (callbacks?.onSuccess) callbacks.onSuccess();
        },
        onError: (error) => {
            if (callbacks?.onError) callbacks.onError(error);
        },
    });
}
