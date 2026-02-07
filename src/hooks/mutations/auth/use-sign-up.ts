import { signUp } from "@/api/auth";
import { authForm, useMutationCallback } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";

export function useSignUp(callbacks?: useMutationCallback) {
  return useMutation({
    mutationFn: (data: authForm) => signUp(data),
    onSuccess: () => {
      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
