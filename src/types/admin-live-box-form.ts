import type { LiveBoxStatus } from "@/types/live-box";
import type { LiveBoxParticipantCandidate } from "@/types/admin-live-box";

export type LiveBoxFormPanelProps = {
  editingLiveBoxId: number | null;
  title: string;
  categoryInput: string;
  participantSearch: string;
  selectedParticipants: LiveBoxParticipantCandidate[];
  filteredParticipants: LiveBoxParticipantCandidate[];
  startsAt: string;
  endsAt: string;
  description: string;
  status: LiveBoxStatus;
  statusOptions: LiveBoxStatus[];
  isSubmitting: boolean;
  onTitleChange: (value: string) => void;
  onCategoryInputChange: (value: string) => void;
  onParticipantSearchChange: (value: string) => void;
  onAddParticipant: (platformId: string) => void;
  onRemoveParticipant: (platformId: string) => void;
  onStartsAtChange: (value: string) => void;
  onEndsAtChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onStatusChange: (value: LiveBoxStatus) => void;
  onCancel: () => void;
  onSubmit: () => void;
};
