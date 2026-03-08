import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchMyProfilePrivacy, updateMyProfilePrivacy } from "@/api/profile-privacy";
import type { AppUser } from "@/types/auth";

export function useProfilePrivacy(user: AppUser | null) {
  const [isPrivacyLoading, setIsPrivacyLoading] = useState(true);
  const [isSavingPrivacy, setIsSavingPrivacy] = useState(false);
  const [showAccountInfo, setShowAccountInfo] = useState(true);
  const [showFavorites, setShowFavorites] = useState(true);
  const [showDonationRanks, setShowDonationRanks] = useState(true);

  useEffect(() => {
    if (!user) return;

    let mounted = true;
    const loadPrivacy = async () => {
      setIsPrivacyLoading(true);
      try {
        const response = await fetchMyProfilePrivacy();
        if (!mounted) return;
        setShowAccountInfo(Boolean(response.privacy.show_account_info));
        setShowFavorites(Boolean(response.privacy.show_favorites));
        setShowDonationRanks(Boolean(response.privacy.show_donation_ranks));
      } catch (error) {
        if (!mounted) return;
        const message =
          error instanceof Error ? error.message : "공개 범위 정보를 불러오지 못했습니다.";
        toast.error(message);
      } finally {
        if (mounted) setIsPrivacyLoading(false);
      }
    };

    loadPrivacy();
    return () => {
      mounted = false;
    };
  }, [user]);

  const toggleAccountInfo = useCallback(async () => {
    if (isPrivacyLoading || isSavingPrivacy) return;

    const nextValue = !showAccountInfo;
    setShowAccountInfo(nextValue);
    setIsSavingPrivacy(true);
    try {
      await updateMyProfilePrivacy({ showAccountInfo: nextValue });
      toast.success(nextValue ? "계정정보를 공개로 변경했습니다." : "계정정보를 비공개로 변경했습니다.");
    } catch (error) {
      setShowAccountInfo(!nextValue);
      const message =
        error instanceof Error ? error.message : "계정정보 공개 설정 변경에 실패했습니다.";
      toast.error(message);
    } finally {
      setIsSavingPrivacy(false);
    }
  }, [isPrivacyLoading, isSavingPrivacy, showAccountInfo]);

  const toggleFavorites = useCallback(async () => {
    if (isPrivacyLoading || isSavingPrivacy) return;

    const nextValue = !showFavorites;
    setShowFavorites(nextValue);
    setIsSavingPrivacy(true);
    try {
      await updateMyProfilePrivacy({ showFavorites: nextValue });
      toast.success(nextValue ? "즐겨찾기를 공개로 변경했습니다." : "즐겨찾기를 비공개로 변경했습니다.");
    } catch (error) {
      setShowFavorites(!nextValue);
      const message =
        error instanceof Error ? error.message : "즐겨찾기 공개 설정 변경에 실패했습니다.";
      toast.error(message);
    } finally {
      setIsSavingPrivacy(false);
    }
  }, [isPrivacyLoading, isSavingPrivacy, showFavorites]);

  const toggleDonationRanks = useCallback(async () => {
    if (isPrivacyLoading || isSavingPrivacy) return;

    const nextValue = !showDonationRanks;
    setShowDonationRanks(nextValue);
    setIsSavingPrivacy(true);
    try {
      await updateMyProfilePrivacy({ showDonationRanks: nextValue });
      toast.success(nextValue ? "하트 기부 랭크를 공개로 변경했습니다." : "하트 기부 랭크를 비공개로 변경했습니다.");
    } catch (error) {
      setShowDonationRanks(!nextValue);
      const message =
        error instanceof Error ? error.message : "하트 기부 랭크 공개 설정 변경에 실패했습니다.";
      toast.error(message);
    } finally {
      setIsSavingPrivacy(false);
    }
  }, [isPrivacyLoading, isSavingPrivacy, showDonationRanks]);

  return {
    isPrivacyLoading,
    isSavingPrivacy,
    showAccountInfo,
    showFavorites,
    showDonationRanks,
    toggleAccountInfo,
    toggleFavorites,
    toggleDonationRanks,
  };
}
