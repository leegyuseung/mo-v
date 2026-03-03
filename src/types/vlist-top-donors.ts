import type { DonorPeriod } from "@/types/heart";

export type TopDonorsSectionProps = {
  streamerId: number;
  className?: string;
};

export type TopDonorsPeriodFilter = {
  key: DonorPeriod;
  label: string;
};
