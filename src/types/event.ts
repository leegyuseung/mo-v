export type DailyGiftBoxStatus = {
    claimedToday: boolean;
    amount: number | null;
};

export type DailyGiftBoxClaimResult = {
    claimedToday: boolean;
    amount: number;
    afterPoint: number | null;
};
