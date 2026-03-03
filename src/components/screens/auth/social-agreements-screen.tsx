"use client";

import { Button } from "@/components/ui/button";
import { TermsModal } from "@/components/screens/auth/terms-modal";
import SignupAgreementsSection from "@/components/screens/auth/signup-agreements-section";
import { useSocialAgreements } from "@/hooks/auth/use-social-agreements";
import type { SocialAgreementsScreenProps } from "@/types/user-agreement";

/** 소셜 로그인 후 필수 약관 동의를 받는 화면 */
export default function SocialAgreementsScreen({ nextPath }: SocialAgreementsScreenProps) {
  const {
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
  } = useSocialAgreements(nextPath);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-4 md:px-0">
      <div className="flex flex-col items-center justify-center gap-4">
        {/* 장식용 로고 - Vercel Image Optimization 비용 절감을 위해 img 태그 사용 */}
        <img
          src="/logo.png"
          alt="logo"
          height={85}
          width={150}
        />
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-900">약관 동의가 필요합니다</h1>
          <p className="mt-1 text-sm text-gray-500">
            소셜 로그인 이용을 위해 필수 약관 동의를 완료해주세요.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4">
        <SignupAgreementsSection
          agreements={agreements}
          isAllChecked={isAllChecked}
          onToggleAll={handleAllCheck}
          onToggleSingle={handleSingleCheck}
          onOpenTermsModal={openModal}
        />
        <Button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting || !isRequiredChecked}
          className="mt-4 h-11 w-full cursor-pointer"
        >
          {isSubmitting ? "처리 중..." : "동의하고 계속"}
        </Button>
      </div>

      <TermsModal
        isOpen={modalContent !== null}
        onClose={closeModal}
        title={modalContent?.title ?? ""}
        content={modalContent?.content ?? ""}
      />
    </div>
  );
}
