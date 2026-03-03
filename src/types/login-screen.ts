import type { OAuthProvider } from "@/types/auth";
import type { FormEvent } from "react";

export type SocialProviderOption = {
  provider: OAuthProvider;
  src: string;
  alt: string;
};

export type LoginEmailConfirmHelpProps = {
  isResendingConfirmEmail: boolean;
  onResend: () => void;
};

export type LoginSocialButtonsProps = {
  isSocialSigningIn: boolean;
  lastProvider: OAuthProvider | null;
  onSocialLogin: (provider: OAuthProvider) => void;
  providers: SocialProviderOption[];
};

export type LoginFormProps = {
  email: string;
  password: string;
  saveEmail: boolean;
  rememberMe: boolean;
  lastProvider: string | null;
  isSigningIn: boolean;
  isResendingConfirmEmail: boolean;
  showEmailConfirmHelp: boolean;
  onSubmit: (event: FormEvent) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSaveEmailChange: (value: boolean) => void;
  onRememberMeChange: (value: boolean) => void;
  onResendConfirmEmail: () => void;
  onFindPassword: () => void;
  onGoSignUp: () => void;
};
