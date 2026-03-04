export type DailyGiftBoxStatus = {
    claimedInCurrentWindow: boolean;
    windowKey: string;
    windowLabel: string;
    amount: number | null;
};

export type DailyGiftBoxClaimResult = {
    claimedInCurrentWindow: boolean;
    windowKey: string;
    windowLabel: string;
    amount: number;
    afterPoint: number | null;
};
