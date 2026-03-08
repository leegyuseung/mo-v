export type AccountStatus = "active" | "suspended" | "banned";

export type ManageUserSanctionPayload =
  | {
      action: "suspend";
      durationDays: number | null;
      reason: string;
      internalNote?: string;
    }
  | {
      action: "unsuspend";
      reason?: string;
      internalNote?: string;
    };

