import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { useCreateLiveBox } from "@/hooks/mutations/admin/use-create-live-box";
import { useUpdateLiveBox } from "@/hooks/mutations/admin/use-update-live-box";
import type { Streamer } from "@/types/streamer";
import type { LiveBoxStatus, LiveBoxWithCreatorProfile } from "@/types/live-box";
import type {
  LiveBoxFormSubmitPayload,
  LiveBoxParticipantCandidate,
} from "@/types/admin-live-box";
import {
  formatLiveBoxDate,
  getLiveBoxParticipantCandidate,
  normalizeLiveBoxStatus,
  parseLiveBoxCategoryInput,
} from "@/utils/admin-live-box";
import { toSeoulBoundaryIso } from "@/utils/seoul-time";

type UseAdminLiveBoxFormStateParams = {
  boxes: LiveBoxWithCreatorProfile[] | undefined;
  streamers: Streamer[];
};

/**
 * 관리자 라이브박스 폼 상태/행동을 한 곳에 모은 커스텀 훅.
 * 왜: 화면 컴포넌트는 레이아웃 렌더링만 담당하고 비즈니스 로직은 분리하기 위함.
 */
export function useAdminLiveBoxFormState({
  boxes,
  streamers,
}: UseAdminLiveBoxFormStateParams) {
  const { mutate: createLiveBox, isPending: isCreating } = useCreateLiveBox();
  const { mutate: updateLiveBox, isPending: isUpdating } = useUpdateLiveBox();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingLiveBoxId, setEditingLiveBoxId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [categoryInput, setCategoryInput] = useState("");
  const [participantSearch, setParticipantSearch] = useState("");
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<LiveBoxStatus>("대기");

  const participantCandidates = useMemo(() => {
    return streamers
      .map(getLiveBoxParticipantCandidate)
      .filter((item): item is LiveBoxParticipantCandidate => item !== null);
  }, [streamers]);

  const participantCandidateById = useMemo(() => {
    return new Map(participantCandidates.map((candidate) => [candidate.platformId, candidate]));
  }, [participantCandidates]);

  const selectedParticipants = useMemo(() => {
    return selectedParticipantIds.map((platformId) => {
      const found = participantCandidateById.get(platformId);
      if (found) return found;
      return {
        streamerId: -1,
        platformId,
        platformLabel: "CHZZK" as const,
        nickname: null,
      };
    });
  }, [selectedParticipantIds, participantCandidateById]);

  const filteredParticipants = useMemo(() => {
    const keyword = participantSearch.trim().toLowerCase();
    if (!keyword) return [];

    return participantCandidates
      .filter((candidate) => {
        if (selectedParticipantIds.includes(candidate.platformId)) return false;
        const nickname = (candidate.nickname || "").toLowerCase();
        return nickname.includes(keyword);
      })
      .slice(0, 8);
  }, [participantCandidates, participantSearch, selectedParticipantIds]);

  const resetForm = useCallback(() => {
    setEditingLiveBoxId(null);
    setTitle("");
    setCategoryInput("");
    setParticipantSearch("");
    setSelectedParticipantIds([]);
    setStartsAt("");
    setEndsAt("");
    setDescription("");
    setStatus("대기");
  }, []);

  const addParticipant = useCallback((platformId: string) => {
    setSelectedParticipantIds((prev) => {
      if (prev.includes(platformId)) return prev;
      return [...prev, platformId];
    });
    setParticipantSearch("");
  }, []);

  const removeParticipant = useCallback((platformId: string) => {
    setSelectedParticipantIds((prev) => prev.filter((id) => id !== platformId));
  }, []);

  const startEdit = useCallback(
    (liveBoxId: number) => {
      const target = boxes?.find((box) => box.id === liveBoxId);
      if (!target) return;

      setEditingLiveBoxId(target.id);
      setTitle(target.title);
      setCategoryInput(target.category.join(", "));
      setSelectedParticipantIds(target.participant_streamer_ids);
      setStartsAt(target.starts_at ? formatLiveBoxDate(target.starts_at) : "");
      setEndsAt(target.ends_at ? formatLiveBoxDate(target.ends_at) : "");
      setDescription(target.description || "");
      setStatus(normalizeLiveBoxStatus(target.status));
      setParticipantSearch("");
      setIsAddOpen(true);
    },
    [boxes]
  );

  const closeFormPanel = useCallback(() => {
    resetForm();
    setIsAddOpen(false);
  }, [resetForm]);

  const onToggleAddPanel = useCallback(() => {
    if (isAddOpen) {
      closeFormPanel();
      return;
    }
    setIsAddOpen(true);
  }, [closeFormPanel, isAddOpen]);

  const handleSubmit = useCallback(() => {
    if (!title.trim()) {
      toast.error("제목은 필수입니다.");
      return;
    }

    const categories = parseLiveBoxCategoryInput(categoryInput);
    if (categories.length === 0) {
      toast.error("카테고리를 1개 이상 입력해 주세요.");
      return;
    }

    if (startsAt && endsAt && startsAt > endsAt) {
      toast.error("시작일시는 종료일시보다 늦을 수 없습니다.");
      return;
    }

    const startsAtIso = startsAt ? toSeoulBoundaryIso(startsAt, "start") : null;
    const endsAtIso = endsAt ? toSeoulBoundaryIso(endsAt, "end") : null;

    if (startsAt && !startsAtIso) {
      toast.error("시작일시 형식이 올바르지 않습니다.");
      return;
    }

    if (endsAt && !endsAtIso) {
      toast.error("종료일시 형식이 올바르지 않습니다.");
      return;
    }

    const payload: LiveBoxFormSubmitPayload = {
      title: title.trim(),
      category: categories,
      participant_streamer_ids: selectedParticipantIds,
      starts_at: startsAtIso,
      ends_at: endsAtIso,
      description: description.trim() || null,
      status,
    };

    if (editingLiveBoxId) {
      updateLiveBox(
        {
          liveBoxId: editingLiveBoxId,
          payload,
        },
        {
          onSuccess: closeFormPanel,
        }
      );
      return;
    }

    createLiveBox(payload, {
      onSuccess: closeFormPanel,
    });
  }, [
    title,
    categoryInput,
    startsAt,
    endsAt,
    selectedParticipantIds,
    description,
    status,
    editingLiveBoxId,
    updateLiveBox,
    createLiveBox,
    closeFormPanel,
  ]);

  return {
    isAddOpen,
    editingLiveBoxId,
    title,
    categoryInput,
    participantSearch,
    selectedParticipants,
    filteredParticipants,
    startsAt,
    endsAt,
    description,
    status,
    isSubmitting: isCreating || isUpdating,
    setTitle,
    setCategoryInput,
    setParticipantSearch,
    setStartsAt,
    setEndsAt,
    setDescription,
    setStatus,
    addParticipant,
    removeParticipant,
    startEdit,
    closeFormPanel,
    onToggleAddPanel,
    handleSubmit,
  };
}
