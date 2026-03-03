import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  INITIAL_SIGNUP_AGREEMENTS_STATE,
  SIGNUP_AGREEMENTS,
} from "@/components/screens/auth/signup-screen-constants";
import { saveUserAgreements } from "@/api/user-agreement";
import { useAuthStore } from "@/store/useAuthStore";
import type { AgreementId, SignUpAgreementsState, TermsModalContent } from "@/types/signup-screen";

/**
 * 소셜 로그인 후 약관 동의 화면의 상태 관리 및 제출 로직을 캡슐화한다.
 *
 * 소셜 로그인은 이메일 회원가입과 달리 약관 동의 단계가 별도 화면으로 분리되어 있어,
 * 동의 상태·모달·제출을 하나의 훅으로 관리하여 UI 컴포넌트를 경량화한다.
 */
export function useSocialAgreements(nextPath: string) {
  const router = useRouter();
  const { initializeSession } = useAuthStore();
  const [agreements, setAgreements] = useState<SignUpAgreementsState>(INITIAL_SIGNUP_AGREEMENTS_STATE);
  const [modalContent, setModalContent] = useState<TermsModalContent>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAllChecked = Object.values(agreements).every(Boolean);
  const isRequiredChecked = SIGNUP_AGREEMENTS
    .filter((agreement) => agreement.required)
    .every((agreement) => agreements[agreement.id]);

  const handleAllCheck = useCallback((checked: boolean) => {
    const nextState = SIGNUP_AGREEMENTS.reduce((acc, agreement) => {
      acc[agreement.id] = checked;
      return acc;
    }, {} as SignUpAgreementsState);
    setAgreements(nextState);
  }, []);

  const handleSingleCheck = useCallback((id: AgreementId, checked: boolean) => {
    setAgreements((prev) => ({ ...prev, [id]: checked }));
  }, []);

  const openModal = useCallback((title: string, content: string) => {
    setModalContent({ title, content });
  }, []);

  const closeModal = useCallback(() => {
    setModalContent(null);
  }, []);

  const onSubmit = async () => {
    if (!isRequiredChecked) {
      toast.error("필수 약관에 동의해주세요.");
      return;
    }
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await saveUserAgreements({
        terms: agreements.terms,
        privacy: agreements.privacy,
        thirdParty: agreements.thirdParty,
        marketing: agreements.marketing,
      });
      await initializeSession();
      toast.success("약관 동의가 완료되었습니다.");
      router.replace(nextPath);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "약관 동의 처리 중 오류가 발생했습니다.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    agreements,
    modalContent,
    isSubmitting,
    isAllChecked,
    isRequiredChecked,
    handleAllCheck,
    handleSingleCheck,
    openModal,
    closeModal,
    onSubmit,
  };
}
