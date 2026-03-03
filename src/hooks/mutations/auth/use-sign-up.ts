import { signUp } from "@/api/auth";
import type { MutationCallback, SignUpInput } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";

export function useSignUp(callbacks?: MutationCallback) {
  return useMutation({
    mutationFn: (data: SignUpInput) => signUp(data),
    onSuccess: () => {
      if (callbacks?.onSuccess) callbacks.onSuccess();
    },
    onError: (error) => {
      if (callbacks?.onError) callbacks.onError(error);
    },
  });
}
