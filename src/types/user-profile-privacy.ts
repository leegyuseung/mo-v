export type UserProfilePrivacy = {
  show_account_info: boolean;
  show_favorites: boolean;
  show_donation_ranks: boolean;
  updated_at: string | null;
};

export type UserProfilePrivacyStatusResponse = {
  privacy: UserProfilePrivacy;
};

export type UpdateUserProfilePrivacyPayload = {
  showAccountInfo?: boolean;
  showFavorites?: boolean;
  showDonationRanks?: boolean;
};
