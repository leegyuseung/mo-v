type authForm = {
  email: string;
  password: string;
};

type useMutationCallback = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onMutate?: () => void;
  onSettled?: () => void;
};

export type { authForm, useMutationCallback };
