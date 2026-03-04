import PublicUserAccountSection from "@/components/screens/user/public-user-account-section";
import PublicUserDonationRanksSection from "@/components/screens/user/public-user-donation-ranks-section";
import PublicUserFavoritesSection from "@/components/screens/user/public-user-favorites-section";
import PublicUserHeaderSection from "@/components/screens/user/public-user-header-section";
import type { PublicUserProfileScreenProps } from "@/types/public-user-profile";

export default function PublicUserProfileScreen({ profile }: PublicUserProfileScreenProps) {
  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6">
      <PublicUserHeaderSection identity={profile.identity} isOwner={profile.isOwner} />
      <PublicUserAccountSection
        canViewAccountInfo={profile.canViewAccountInfo}
        accountInfo={profile.accountInfo}
      />
      <PublicUserFavoritesSection
        canViewFavorites={profile.canViewFavorites}
        favorites={profile.favorites}
      />
      <PublicUserDonationRanksSection
        canViewDonationRanks={profile.canViewDonationRanks}
        donationRanks={profile.donationRanks}
      />
    </div>
  );
}
