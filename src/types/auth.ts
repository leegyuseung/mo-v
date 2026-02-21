import { User } from "@supabase/supabase-js";
import type { Profile, HeartPoints } from "@/types/profile";

export type AuthForm = {
  email: string;
  password: string;
};

export type MutationCallback = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onMutate?: () => void;
  onSettled?: () => void;
};

export type AuthState = {
  user: User | null;
  profile: Profile | null;
  heartPoints: HeartPoints | null;
  isLoading: boolean;
  isInitialized: boolean;
};

export type AuthActions = {
  setUser: (user: User | null) => void;
  setProfile: (profile: Profile | null) => void;
  setHeartPoints: (heartPoints: HeartPoints | null) => void;
  setSession: (
    user: User | null,
    profile: Profile | null,
    heartPoints: HeartPoints | null
  ) => void;
  clearSession: () => void;
  initializeSession: () => Promise<void>;
};

export type DeleteAccountInput = {
  provider: string | null | undefined;
  email?: string;
  password?: string;
};
