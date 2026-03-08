import type {
  AdminHomeBroadcastItem,
  AdminHomeBroadcastStatusFilter,
} from "@/types/admin-home-broadcast";

export type AdminHomeBroadcastFiltersProps = {
  searchKeyword: string;
  statusFilter: AdminHomeBroadcastStatusFilter;
  onSearchKeywordChange: (value: string) => void;
  onStatusFilterChange: (value: AdminHomeBroadcastStatusFilter) => void;
};

export type AdminHomeBroadcastTableProps = {
  items: AdminHomeBroadcastItem[];
  isLoading: boolean;
  isError: boolean;
  onDeleteClick: (item: AdminHomeBroadcastItem) => void;
};

export type AdminHomeBroadcastDeleteDialogProps = {
  deleteReason: string;
  deleteTarget: AdminHomeBroadcastItem | null;
  isDeleting: boolean;
  onDeleteReasonChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};
