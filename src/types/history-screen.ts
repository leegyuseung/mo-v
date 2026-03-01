import type { HeartPointHistory } from "@/types/profile";

export type HistoryFilter = "all" | "plus" | "minus";
export type HistoryTypeFilter = "all" | string;

export type HistoryFilterOption = {
  value: HistoryFilter;
  label: string;
};

export type HistoryFilterBarProps = {
  filter: HistoryFilter;
  typeFilter: HistoryTypeFilter;
  typeOptions: string[];
  startDateFilter: string;
  endDateFilter: string;
  onChangeFilter: (filter: HistoryFilter) => void;
  onChangeTypeFilter: (type: HistoryTypeFilter) => void;
  onChangeStartDateFilter: (date: string) => void;
  onChangeEndDateFilter: (date: string) => void;
  onResetDateFilter: () => void;
};

export type HistoryListProps = {
  isLoading: boolean;
  filteredCount: number;
  pagedHistory: HeartPointHistory[];
};
