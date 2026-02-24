"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/useAuthStore";
import { useUpdateProfile } from "@/hooks/mutations/profile/use-update-profile";
import { usePasswordChange } from "@/hooks/profile/use-password-change";
import { useWithdrawAccount } from "@/hooks/profile/use-withdraw-account";
import { useAvatarUpload } from "@/hooks/profile/use-avatar-upload";
import { profileSchema, ProfileFormValues } from "@/utils/schema";
import { Separator } from "@/components/ui/separator";
import ProfileAccountInfoSection from "@/components/screens/profile/profile-account-info-section";
import ProfileActionButtons from "@/components/screens/profile/profile-action-buttons";
import ProfileAvatarSection from "@/components/screens/profile/profile-avatar-section";
import ProfileBasicFieldsSection from "@/components/screens/profile/profile-basic-fields-section";
import ProfileLoadingState from "@/components/screens/profile/profile-loading-state";
import ProfileLoginRequiredState from "@/components/screens/profile/profile-login-required-state";
import ProfilePasswordPanel from "@/components/screens/profile/profile-password-panel";
import ProfileWithdrawDialogs from "@/components/screens/profile/profile-withdraw-dialogs";

type ProfileScreenProps = {
  embedded?: boolean;
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function ProfileScreen({ embedded = false }: ProfileScreenProps) {
  const { user, profile, heartPoints, isLoading } = useAuthStore();
  const { mutate: updateProfile, isPending } = useUpdateProfile();
  const {
    currentPw,
    setCurrentPw,
    newPw,
    setNewPw,
    confirmPw,
    setConfirmPw,
    showCurrentPw,
    setShowCurrentPw,
    showNewPw,
    setShowNewPw,
    showConfirmPw,
    setShowConfirmPw,
    isPwChanging,
    handleChangePassword,
  } = usePasswordChange();
  const {
    isWithdrawAlertOpen,
    setIsWithdrawAlertOpen,
    isWithdrawConfirmOpen,
    setIsWithdrawConfirmOpen,
    isEmailProvider,
    withdrawPassword,
    setWithdrawPassword,
    withdrawPasswordConfirm,
    setWithdrawPasswordConfirm,
    withdrawConfirmText,
    setWithdrawConfirmText,
    isWithdrawing,
    handleWithdrawAccount,
    closeWithdrawConfirmModal,
  } = useWithdrawAccount();
  const {
    fileInputRef,
    avatarPreview,
    avatarFile,
    handleAvatarClick,
    handleAvatarChange,
    handleRemoveAvatar,
  } = useAvatarUpload();

  const loadingContainerClass = embedded ? "w-full" : "max-w-2xl mx-auto p-6 mt-4";
  const emptyContainerClass = embedded ? "w-full" : "max-w-2xl mx-auto p-6 mt-8";
  const contentContainerClass = embedded ? "w-full" : "max-w-2xl mx-auto p-6 mt-4";

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      nickname: "",
      bio: "",
    },
  });

  const bioValue = useWatch({ control, name: "bio" });

  useEffect(() => {
    if (!profile) return;
    reset({
      nickname: profile.nickname || "",
      bio: profile.bio || "",
    });
  }, [profile, reset]);

  const isFirstEdit = profile?.is_first_edit ?? false;

  const onSubmit = (data: ProfileFormValues) => {
    if (!user) return;

    updateProfile({
      userId: user.id,
      nickname: data.nickname,
      bio: data.bio || "",
      avatarFile,
      isFirstEdit,
    });
  };

  const hasChanges = isDirty || avatarFile !== null;

  if (isLoading) {
    return <ProfileLoadingState className={loadingContainerClass} />;
  }

  if (!user || !profile) {
    return <ProfileLoginRequiredState className={emptyContainerClass} />;
  }

  return (
    <div className={contentContainerClass}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <ProfileAvatarSection
          profileAvatarUrl={profile.avatar_url}
          avatarPreview={avatarPreview}
          avatarFile={avatarFile}
          fileInputRef={fileInputRef}
          onAvatarClick={handleAvatarClick}
          onAvatarChange={handleAvatarChange}
          onRemoveAvatar={handleRemoveAvatar}
        />

        <ProfileBasicFieldsSection
          register={register}
          errors={errors}
          bioLength={bioValue?.length || 0}
        />

        <Separator />

        <ProfileAccountInfoSection
          email={profile.email || user.email || "-"}
          createdAt={formatDate(profile.created_at)}
          heartPoint={heartPoints?.point || 0}
        />

        <ProfilePasswordPanel
          enabled={user.app_metadata?.provider === "email"}
          currentPw={currentPw}
          setCurrentPw={setCurrentPw}
          newPw={newPw}
          setNewPw={setNewPw}
          confirmPw={confirmPw}
          setConfirmPw={setConfirmPw}
          showCurrentPw={showCurrentPw}
          setShowCurrentPw={setShowCurrentPw}
          showNewPw={showNewPw}
          setShowNewPw={setShowNewPw}
          showConfirmPw={showConfirmPw}
          setShowConfirmPw={setShowConfirmPw}
          isPwChanging={isPwChanging}
          handleChangePassword={handleChangePassword}
        />

        <Separator />

        <ProfileActionButtons
          isFirstEdit={isFirstEdit}
          hasChanges={hasChanges}
          isPending={isPending}
          onOpenWithdrawAlert={() => setIsWithdrawAlertOpen(true)}
        />
      </form>

      <ProfileWithdrawDialogs
        isWithdrawAlertOpen={isWithdrawAlertOpen}
        setIsWithdrawAlertOpen={setIsWithdrawAlertOpen}
        isWithdrawConfirmOpen={isWithdrawConfirmOpen}
        setIsWithdrawConfirmOpen={setIsWithdrawConfirmOpen}
        isEmailProvider={isEmailProvider}
        withdrawPassword={withdrawPassword}
        setWithdrawPassword={setWithdrawPassword}
        withdrawPasswordConfirm={withdrawPasswordConfirm}
        setWithdrawPasswordConfirm={setWithdrawPasswordConfirm}
        withdrawConfirmText={withdrawConfirmText}
        setWithdrawConfirmText={setWithdrawConfirmText}
        isWithdrawing={isWithdrawing}
        handleWithdrawAccount={handleWithdrawAccount}
        closeWithdrawConfirmModal={closeWithdrawConfirmModal}
      />
    </div>
  );
}
