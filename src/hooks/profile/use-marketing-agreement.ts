import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchUserAgreementStatus, updateMarketingAgreement } from "@/api/user-agreement";
import type { AppUser } from "@/types/auth";

/**
 * 프로필 설정 화면의 마케팅 수신 동의 상태 관리를 캡슐화한다.
 *
 * 마케팅 동의는 약관 동의와 별개로 사용자가 언제든 변경할 수 있어야 하므로,
 * 조회(GET)·변경(PATCH)을 하나의 훅으로 묶어 optimistic update 패턴을 적용했다.
 */
export function useMarketingAgreement(user: AppUser | null) {
  const [isAgreementLoading, setIsAgreementLoading] = useState(true);
  const [isSavingMarketing, setIsSavingMarketing] = useState(false);
  const [marketingAccepted, setMarketingAccepted] = useState(false);

  useEffect(() => {
    if (!user) return;

    let mounted = true;
    const loadAgreement = async () => {
      setIsAgreementLoading(true);
      try {
        const response = await fetchUserAgreementStatus();
        if (!mounted) return;
        setMarketingAccepted(Boolean(response.agreement?.marketing_accepted));
      } catch (error) {
        if (!mounted) return;
        const message =
          error instanceof Error ? error.message : "마케팅 수신 동의 상태를 불러오지 못했습니다.";
        toast.error(message);
      } finally {
        if (mounted) {
          setIsAgreementLoading(false);
        }
      }
    };

    loadAgreement();
    return () => {
      mounted = false;
    };
  }, [user]);

  /** optimistic update로 토글 후, 실패 시 롤백한다 */
  const handleToggleMarketing = useCallback(async () => {
    if (isSavingMarketing || isAgreementLoading) return;

    const nextValue = !marketingAccepted;
    setMarketingAccepted(nextValue);
    setIsSavingMarketing(true);
    try {
      await updateMarketingAgreement(nextValue);
      toast.success(
        nextValue
          ? "마케팅 정보 수신에 동의했습니다."
          : "마케팅 정보 수신을 비동의로 변경했습니다."
      );
    } catch (error) {
      setMarketingAccepted(!nextValue);
      const message =
        error instanceof Error ? error.message : "마케팅 수신 동의 변경에 실패했습니다.";
      toast.error(message);
    } finally {
      setIsSavingMarketing(false);
    }
  }, [isSavingMarketing, isAgreementLoading, marketingAccepted]);

  return {
    isAgreementLoading,
    isSavingMarketing,
    marketingAccepted,
    handleToggleMarketing,
  };
}
