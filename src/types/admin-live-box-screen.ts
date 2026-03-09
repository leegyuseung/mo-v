import type { LiveBoxWithCreatorProfile } from "@/types/live-box";
import type { LiveBoxAdminPendingRequest } from "@/types/live-box-request";
import type { LiveBoxParticipantCandidate } from "@/types/admin-live-box";

export type AdminLiveBoxesTableProps = {
  boxes: LiveBoxWithCreatorProfile[] | undefined;
  isLoading: boolean;
  isError: boolean;
  onStartEdit: (liveBoxId: number) => void;
};

export type AdminLiveBoxPendingRequestsTableProps = {
  pendingLiveBoxRequests: LiveBoxAdminPendingRequest[] | undefined;
  participantCandidates: LiveBoxParticipantCandidate[];
  isLoading: boolean;
  isError: boolean;
};
