import { signUp } from "@/api/auth";
import type { AuthForm, MutationCallback } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";

export function useSignUp(callbacks?: MutationCallback) {
  return useMutation({
    mutationFn: (data: AuthForm) => signUp(data),
    onSuccess: () => {
      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
