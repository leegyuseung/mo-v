import type { HomeBroadcastItem } from "@/types/home-broadcast";

export type HomeBroadcastCreateModalProps = {
  isOpen: boolean;
  isCreating: boolean;
  isPointInsufficient: boolean;
  currentPoint: number;
  costPoint: number;
  contentInput: string;
  onContentInputChange: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
};

export type HomeBroadcastFeedProps = {
  isExpanded: boolean;
  isLoading: boolean;
  isError: boolean;
  nowMs: number;
  visibleLines: HomeBroadcastItem[];
  collapsedBroadcast: HomeBroadcastItem | null;
};
