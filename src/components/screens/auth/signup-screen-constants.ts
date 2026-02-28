import termsMd from "@/app/(auth)/signup/agreements/terms.md";
import privacyMd from "@/app/(auth)/signup/agreements/privacy.md";
import thirdPartyMd from "@/app/(auth)/signup/agreements/third_party.md";
import marketingMd from "@/app/(auth)/signup/agreements/marketing.md";
import type {
  SignUpAgreementsState,
  SignUpAgreement,
  SignUpErrorCode,
} from "@/types/signup-screen";

export const SIGNUP_AGREEMENTS: readonly SignUpAgreement[] = [
  { id: "terms", title: "서비스 이용약관 동의", required: true, content: termsMd },
  { id: "privacy", title: "개인정보 수집 및 이용 동의", required: true, content: privacyMd },
  { id: "thirdParty", title: "개인정보 처리 위탁 동의", required: false, content: thirdPartyMd },
  { id: "marketing", title: "마케팅 정보 수신 동의", required: false, content: marketingMd },
];

export const INITIAL_SIGNUP_AGREEMENTS_STATE: SignUpAgreementsState = {
  terms: false,
  privacy: false,
  thirdParty: false,
  marketing: false,
};

const SIGNUP_ERROR_MESSAGE_BY_CODE: Record<SignUpErrorCode, string> = {
  user_already_exists: "이미 가입된 이메일입니다.",
  email_address_invalid: "유효하지 않은 이메일 형식입니다.",
  signup_disabled: "현재 회원가입이 비활성화되어 있습니다.",
  over_email_send_rate_limit: "단시간에 너무 많은 요청이 있었습니다. 잠시 후 다시 시도해주세요.",
};

export function getSignupErrorMessage(errorCode?: string) {
  if (!errorCode) return "회원가입 중 오류가 발생했습니다.";
  return SIGNUP_ERROR_MESSAGE_BY_CODE[errorCode as SignUpErrorCode] || "회원가입 중 오류가 발생했습니다.";
}
