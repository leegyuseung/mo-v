import type { Profile, HeartPoints } from "@/types/profile";
import type { UserAgreementState } from "@/types/user-agreement";

export type AppUser = {
  email: string | null;
  id: string;
  provider: string | null;
};

export type AuthForm = {
  email: string;
  password: string;
};

export type SignUpInput = AuthForm & {
  agreements: UserAgreementState;
};

export type OAuthProvider = "google" | "kakao";

export type SignUpBonusClaimResponse = {
  ok: boolean;
  granted: boolean;
  afterPoint: number;
};

export type MutationCallback = {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onMutate?: () => void;
  onSettled?: () => void;
};

export type AuthState = {
  user: AppUser | null;
  profile: Profile | null;
  heartPoints: HeartPoints | null;
  isLoading: boolean;
  isInitialized: boolean;
};

export type AuthActions = {
  setUser: (user: AppUser | null) => void;
  setProfile: (profile: Profile | null) => void;
  setHeartPoints: (heartPoints: HeartPoints | null) => void;
  setSession: (
    user: AppUser | null,
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
