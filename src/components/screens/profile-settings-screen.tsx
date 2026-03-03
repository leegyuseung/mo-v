"use client";

import { Settings } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useMarketingAgreement } from "@/hooks/profile/use-marketing-agreement";
import ProfileLoginRequiredState from "@/components/screens/profile/profile-login-required-state";
import type { ProfileSettingsScreenProps } from "@/types/user-agreement";

/** 프로필 > 계정 설정 화면. 마케팅 수신 동의 등 사용자 설정을 관리한다 */
export default function ProfileSettingsScreen({ embedded = false }: ProfileSettingsScreenProps) {
  const { user, isLoading } = useAuthStore();
  const { isAgreementLoading, isSavingMarketing, marketingAccepted, handleToggleMarketing } =
    useMarketingAgreement(user);
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

        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">마케팅 정보 수신 동의</h2>
              <p className="mt-1 text-xs text-gray-500">
                동의 시 신규 기능, 이벤트, 혜택 안내를 받을 수 있습니다.
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleMarketing}
              disabled={isAgreementLoading || isSavingMarketing}
              aria-pressed={marketingAccepted}
              className={`relative inline-flex h-7 w-12 cursor-pointer items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                marketingAccepted ? "bg-gray-900" : "bg-gray-300"
              }`}
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                  marketingAccepted ? "translate-x-6" : "translate-x-1"
                }`}
              />
              <span className="sr-only">마케팅 정보 수신 동의 토글</span>
            </button>
          </div>

          <p className="mt-3 text-xs text-gray-500">
            현재 상태: {marketingAccepted ? "동의" : "비동의"}
            {isSavingMarketing ? " (저장 중...)" : ""}
          </p>
        </div>
      </section>
    </div>
  );
}
