export type AgreementId = "terms" | "privacy" | "thirdParty" | "marketing";

export type SignUpAgreement = {
  id: AgreementId;
  title: string;
  required: boolean;
  content: string;
};

export type SignUpAgreementsState = Record<AgreementId, boolean>;

export type TermsModalContent = {
  title: string;
  content: string;
} | null;

export type SignUpErrorCode =
  | "user_already_exists"
  | "email_address_invalid"
  | "signup_disabled"
  | "over_email_send_rate_limit";
