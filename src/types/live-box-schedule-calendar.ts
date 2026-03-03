import type { LiveBox } from "@/types/live-box";

export type LiveBoxScheduleCalendarModalProps = {
  open: boolean;
  liveBoxes: LiveBox[];
  isLoading: boolean;
  onClose: () => void;
};

export type LiveBoxScheduleRange = {
  id: number;
  title: string;
  startsAt: Date;
  endsAt: Date;
  startsAtRaw: string;
  endsAtRaw: string;
};
