"use client";

import { Settings } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useMarketingAgreement } from "@/hooks/profile/use-marketing-agreement";
import { useProfilePrivacy } from "@/hooks/profile/use-profile-privacy";
import ProfileLoginRequiredState from "@/components/screens/profile/profile-login-required-state";
import type { ProfileSettingsScreenProps } from "@/types/user-agreement";
import type { SettingToggleCardProps } from "@/types/profile-settings";

function SettingToggleCard({
  title,
  description,
  checked,
  disabled,
  saving,
  onToggle,
  enabledLabel,
  disabledLabel,
}: SettingToggleCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        </div>

        <button
          type="button"
          onClick={onToggle}
          disabled={disabled}
          aria-pressed={checked}
          className={`relative inline-flex h-7 w-12 cursor-pointer items-center rounded-full disabled:cursor-not-allowed disabled:opacity-60 ${
            checked ? "bg-gray-900" : "bg-gray-300"
          }`}
        >
          <span
            className="inline-block h-5 w-5 translate-x-1 rounded-full bg-white shadow"
          />
        </button>
      </div>

      <p className="mt-3 text-xs text-gray-500">
        현재 상태: {checked ? enabledLabel : disabledLabel}
        {saving ? " (저장 중...)" : ""}
      </p>
    </div>
  );
}

/** 프로필 > 계정 설정 화면. 마케팅 수신 동의 등 사용자 설정을 관리한다 */
export default function ProfileSettingsScreen({ embedded = false }: ProfileSettingsScreenProps) {
  const { user, isLoading } = useAuthStore();
  const { isAgreementLoading, isSavingMarketing, marketingAccepted, handleToggleMarketing } =
    useMarketingAgreement(user);
  const {
    isPrivacyLoading,
    isSavingPrivacy,
    showAccountInfo,
    showFavorites,
    showDonationRanks,
    toggleAccountInfo,
    toggleFavorites,
    toggleDonationRanks,
  } = useProfilePrivacy(user);
  const containerClass = embedded ? "w-full" : "max-w-4xl mx-auto p-6 mt-4";

  if (isLoading) {
    return (
      <div className={containerClass}>
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center text-sm text-gray-500">
          불러오는 중...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <ProfileLoginRequiredState
        className={containerClass}
        description="계정 설정을 이용하려면 먼저 로그인해 주세요."
      />
    );
  }

  return (
    <div className={containerClass}>
      <section className="rounded-2xl border border-gray-100 bg-white p-6">
        <div className="mb-4 flex items-center gap-2 text-gray-900">
          <Settings className="h-5 w-5" />
          <h1 className="text-lg font-semibold">계정 설정</h1>
        </div>

        <div className="space-y-3">
          <SettingToggleCard
            title="계정정보 공개"
            description="프로필 화면에서 이메일/가입일/하트 포인트를 다른 사용자에게 공개합니다."
            checked={showAccountInfo}
            disabled={isPrivacyLoading || isSavingPrivacy}
            saving={isSavingPrivacy}
            onToggle={toggleAccountInfo}
            enabledLabel="공개"
            disabledLabel="비공개"
          />
          <SettingToggleCard
            title="즐겨찾기 공개"
            description="프로필 화면에서 내가 즐겨찾기한 버츄얼/그룹/소속을 공개합니다."
            checked={showFavorites}
            disabled={isPrivacyLoading || isSavingPrivacy}
            saving={isSavingPrivacy}
            onToggle={toggleFavorites}
            enabledLabel="공개"
            disabledLabel="비공개"
          />
          <SettingToggleCard
            title="하트 기부 랭크 공개"
            description="프로필 화면에서 스트리머별 기부 랭크 정보를 공개합니다."
            checked={showDonationRanks}
            disabled={isPrivacyLoading || isSavingPrivacy}
            saving={isSavingPrivacy}
            onToggle={toggleDonationRanks}
            enabledLabel="공개"
            disabledLabel="비공개"
          />
          <SettingToggleCard
            title="마케팅 정보 수신 동의"
            description="동의 시 신규 기능, 이벤트, 혜택 안내를 받을 수 있습니다."
            checked={marketingAccepted}
            disabled={isAgreementLoading || isSavingMarketing}
            saving={isSavingMarketing}
            onToggle={handleToggleMarketing}
            enabledLabel="동의"
            disabledLabel="비동의"
          />
        </div>
      </section>
    </div>
  );
}
