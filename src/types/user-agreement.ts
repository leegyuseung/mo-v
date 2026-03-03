export type UserAgreementState = {
  terms: boolean;
  privacy: boolean;
  thirdParty: boolean;
  marketing: boolean;
};

export type UserAgreementStatusResponse = {
  hasAgreement: boolean;
  requiredAccepted: boolean;
  agreement: {
    terms_accepted: boolean;
    privacy_accepted: boolean;
    third_party_accepted: boolean;
    marketing_accepted: boolean;
    agreed_at: string | null;
  } | null;
};

/** 소셜 로그인 후 약관 동의 화면 props */
export type SocialAgreementsScreenProps = {
  nextPath: string;
};

/** 프로필 계정 설정 화면 props */
export type ProfileSettingsScreenProps = {
  embedded?: boolean;
};

