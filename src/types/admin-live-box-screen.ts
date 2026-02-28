import type { LiveBoxWithCreatorProfile } from "@/types/live-box";
import type { LiveBoxAdminPendingRequest } from "@/types/live-box-request";

export type AdminLiveBoxesTableProps = {
  boxes: LiveBoxWithCreatorProfile[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onStartEdit: (liveBoxId: number) => void;
};

export type AdminLiveBoxPendingRequestsTableProps = {
  pendingLiveBoxRequests: LiveBoxAdminPendingRequest[] | undefined;
  isLoading: boolean;
  isError: boolean;
};
