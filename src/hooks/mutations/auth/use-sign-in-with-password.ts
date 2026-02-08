import { signInWithPassword } from "@/api/auth";
import { useMutationCallback } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function useSignInWithPassword(callbacks?: useMutationCallback) {
  const router = useRouter();

  return useMutation({
    mutationFn: signInWithPassword,
    onSuccess: () => {
      router.replace("/");
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
