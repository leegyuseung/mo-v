import type { DonorPeriod } from "@/types/heart";

export type TopDonorsSectionProps = {
  streamerId: number;
};

export type TopDonorsPeriodFilter = {
  key: DonorPeriod;
  label: string;
};
