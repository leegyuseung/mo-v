import type { StarredCrew, StarredGroup, StarredStreamer } from "@/types/star";

export type PublicUserIdentity = {
  id: string;
  nickname: string | null;
  nicknameCode: string | null;
  avatarUrl: string | null;
  bio: string | null;
};

export type PublicUserAccountInfo = {
  email: string | null;
  createdAt: string;
  heartPoint: number;
};

export type PublicUserDonationRankItem = {
  streamerId: number;
  streamerPublicId: string | null;
  streamerNickname: string | null;
  streamerImageUrl: string | null;
  streamerPlatform: string | null;
  donorRank: number;
  totalSent: number;
  lastSentAt: string | null;
};

export type PublicUserFavorites = {
  streamers: StarredStreamer[];
  groups: StarredGroup[];
  crews: StarredCrew[];
};

export type PublicUserProfileData = {
  identity: PublicUserIdentity;
  isOwner: boolean;
  canViewAccountInfo: boolean;
  canViewFavorites: boolean;
  canViewDonationRanks: boolean;
  accountInfo: PublicUserAccountInfo | null;
  favorites: PublicUserFavorites;
  donationRanks: PublicUserDonationRankItem[];
};

export type PublicUserProfileScreenProps = {
  profile: PublicUserProfileData;
};

export type PublicUserHeaderSectionProps = Pick<PublicUserProfileData, "identity" | "isOwner">;

export type PublicUserAccountSectionProps = Pick<
  PublicUserProfileData,
  "canViewAccountInfo" | "accountInfo"
>;

export type PublicUserFavoritesSectionProps = Pick<
  PublicUserProfileData,
  "canViewFavorites" | "favorites"
>;

export type PublicUserDonationRanksSectionProps = Pick<
  PublicUserProfileData,
  "canViewDonationRanks" | "donationRanks"
>;

export type PublicUserFavoriteTagsSectionProps = {
  title: string;
  items: Array<{ href: string; label: string; imageUrl?: string | null }>;
  emptyText: string;
  large?: boolean;
};
