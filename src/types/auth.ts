type authForm = {
  email: string;
  password: string;
  nickname: string;
};

type useMutationCallback = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onMutate?: () => void;
  onSettled?: () => void;
};

export type { authForm, useMutationCallback };
